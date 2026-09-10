<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendMarketingCampaignEmailJob;
use App\Mail\MarketingCampaignMail;
use App\Models\User;
use App\Modules\Messaging\Domain\CampaignAudienceResolver;
use App\Modules\Messaging\Enums\CampaignAudience;
use App\Modules\Messaging\Enums\CampaignStatus;
use App\Modules\Messaging\Http\Requests\Admin\StoreMarketingCampaignRequest;
use App\Modules\Messaging\Http\Resources\Admin\MarketingCampaignRecipientResource;
use App\Modules\Messaging\Http\Resources\Admin\MarketingCampaignResource;
use App\Modules\Messaging\Models\MarketingCampaign;
use App\Modules\Messaging\Models\MarketingCampaignRecipient;
use App\Shared\Html\HtmlSanitizer;
use Illuminate\Bus\Batch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class MarketingCampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', MarketingCampaign::class);

        $campaigns = MarketingCampaign::query()
            ->with('createdBy')
            ->latest()
            ->paginate(perPage: min((int) $request->integer('perPage', 20), 100));

        return MarketingCampaignResource::collection($campaigns)->response();
    }

    public function store(StoreMarketingCampaignRequest $request): JsonResponse
    {
        $this->authorize('create', MarketingCampaign::class);

        $campaign = MarketingCampaign::query()->create([
            ...$request->validated(),
            'content' => HtmlSanitizer::clean((string) $request->string('content')),
            'status' => CampaignStatus::Draft->value,
            'recipients_count' => 0,
            'sent_count' => 0,
            'failed_count' => 0,
            'created_by_user_id' => $request->user()->id,
        ]);

        return MarketingCampaignResource::make($campaign)->response()->setStatusCode(201);
    }

    public function show(MarketingCampaign $campaign): JsonResponse
    {
        $this->authorize('viewAny', MarketingCampaign::class);

        return MarketingCampaignResource::make($campaign->load('createdBy'))->response();
    }

    /** Modification autorisée uniquement tant que la campagne est un brouillon. */
    public function update(StoreMarketingCampaignRequest $request, MarketingCampaign $campaign): JsonResponse
    {
        $this->authorize('create', MarketingCampaign::class);

        if ($campaign->status !== CampaignStatus::Draft->value) {
            abort(409, 'Seule une campagne en brouillon peut être modifiée.');
        }

        $campaign->update([
            ...$request->validated(),
            'content' => HtmlSanitizer::clean((string) $request->string('content')),
        ]);

        return MarketingCampaignResource::make($campaign)->response();
    }

    public function destroy(MarketingCampaign $campaign): Response
    {
        $this->authorize('create', MarketingCampaign::class);

        if ($campaign->status === CampaignStatus::InProgress->value) {
            abort(409, 'Une campagne en cours d\'envoi ne peut pas être supprimée.');
        }

        $campaign->delete();

        return response()->noContent();
    }

    /** Compteur "Nombre de destinataires" en direct pendant la composition (§6), avant tout enregistrement. */
    public function audienceCount(Request $request): JsonResponse
    {
        $this->authorize('viewAny', MarketingCampaign::class);

        $data = $request->validate([
            'audience_type' => ['required', Rule::enum(CampaignAudience::class)],
            'audience_client_ids' => ['sometimes', 'array'],
            'audience_client_ids.*' => ['integer'],
        ]);

        $count = CampaignAudienceResolver::count(
            CampaignAudience::from($data['audience_type']),
            $data['audience_client_ids'] ?? null,
        );

        return response()->json(['data' => ['count' => $count]]);
    }

    /** Aperçu — rend le HTML réellement envoyé (mise en page + lien de désabonnement factice). */
    public function preview(MarketingCampaign $campaign): Response
    {
        $this->authorize('viewAny', MarketingCampaign::class);

        $html = (new MarketingCampaignMail($campaign, '#'))->render();

        return response($html)->header('Content-Type', 'text/html; charset=utf-8');
    }

    /** « Envoyer un test » — un seul e-mail, à une adresse choisie par l'admin, jamais aux vrais destinataires. */
    public function sendTest(Request $request, MarketingCampaign $campaign): JsonResponse
    {
        $this->authorize('create', MarketingCampaign::class);

        $data = $request->validate(['test_email' => ['required', 'email:rfc,dns']]);

        Mail::to($data['test_email'])->send(new MarketingCampaignMail($campaign, '#'));

        return response()->json(['data' => ['sent_to' => $data['test_email']]]);
    }

    /**
     * Envoi réel (§7) — protégé contre le double-clic (§13) par une
     * transition d'état verrouillée : un double appel concurrent ne peut
     * faire passer qu'UNE seule requête de "draft" à "in_progress", l'autre
     * échoue sur le statut déjà changé.
     */
    public function send(MarketingCampaign $campaign): JsonResponse
    {
        $this->authorize('create', MarketingCampaign::class);

        $locked = DB::transaction(function () use ($campaign): MarketingCampaign {
            $fresh = MarketingCampaign::query()->whereKey($campaign->id)->lockForUpdate()->firstOrFail();

            if (! $fresh->sendable()) {
                abort(409, 'Cette campagne a déjà été envoyée ou est en cours d\'envoi.');
            }

            $fresh->forceFill(['status' => CampaignStatus::InProgress->value, 'started_at' => now()])->save();

            return $fresh;
        });

        $clientIds = CampaignAudienceResolver::forCampaign($locked)->pluck('user_id', 'id');
        $emails = User::query()->whereIn('id', $clientIds->values())->pluck('email', 'id');

        $rows = $clientIds->map(fn ($userId, $clientId): array => [
            'campaign_id' => $locked->id,
            'client_id' => $clientId,
            'email' => $emails[$userId] ?? '',
            'status' => MarketingCampaignRecipient::STATUS_PENDING,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Filtre défensif : pas de vérification DNS ici (des centaines d'appels
        // réseau par envoi seraient lents et inutiles — les e-mails viennent de
        // comptes déjà créés) ; écarte juste une ligne corrompue en base plutôt
        // que de gaspiller un envoi dessus.
        $rows = $rows->filter(fn (array $row): bool => filter_var($row['email'], FILTER_VALIDATE_EMAIL) !== false)->values()->all();

        foreach (array_chunk($rows, 500) as $chunk) {
            MarketingCampaignRecipient::query()->insertOrIgnore($chunk);
        }

        $recipientIds = MarketingCampaignRecipient::query()->where('campaign_id', $locked->id)->pluck('id');
        $locked->forceFill(['recipients_count' => $recipientIds->count()])->save();

        if ($recipientIds->isEmpty()) {
            $locked->forceFill(['status' => CampaignStatus::Completed->value, 'completed_at' => now()])->save();

            return MarketingCampaignResource::make($locked)->response();
        }

        $jobs = $recipientIds->values()->map(
            fn (int $recipientId, int $index): SendMarketingCampaignEmailJob => (new SendMarketingCampaignEmailJob($recipientId))->delay(now()->addSeconds($index)),
        )->all();

        $batch = Bus::batch($jobs)
            ->name('Campagne marketing #'.$locked->id)
            ->finally(function (Batch $batch) use ($locked): void {
                $current = MarketingCampaign::find($locked->id);

                // Une campagne annulée entre-temps (§ cancel) ne doit jamais être
                // ré-écrasée en "Terminée"/"Échec" par la fin (même partielle) du batch.
                if ($current === null || $current->status === CampaignStatus::Cancelled->value) {
                    return;
                }

                $current->forceFill([
                    'status' => $current->sent_count > 0 ? CampaignStatus::Completed->value : CampaignStatus::Failed->value,
                    'completed_at' => now(),
                ])->save();
            })
            ->dispatch();

        $locked->forceFill(['batch_id' => $batch->id])->save();

        return MarketingCampaignResource::make($locked)->response();
    }

    /**
     * Annule une campagne en cours d'envoi — les jobs déjà exécutés restent
     * comptabilisés, ceux encore en file sont ignorés dès leur passage grâce
     * au `$this->batch()?->cancelled()` vérifié dans le job lui-même.
     */
    public function cancel(MarketingCampaign $campaign): JsonResponse
    {
        $this->authorize('create', MarketingCampaign::class);

        $locked = DB::transaction(function () use ($campaign): MarketingCampaign {
            $fresh = MarketingCampaign::query()->whereKey($campaign->id)->lockForUpdate()->firstOrFail();

            if ($fresh->status !== CampaignStatus::InProgress->value) {
                abort(409, 'Seule une campagne en cours d\'envoi peut être annulée.');
            }

            $fresh->forceFill(['status' => CampaignStatus::Cancelled->value, 'completed_at' => now()])->save();

            return $fresh;
        });

        if ($locked->batch_id !== null) {
            Bus::findBatch($locked->batch_id)?->cancel();
        }

        return MarketingCampaignResource::make($locked)->response();
    }

    /** Ne relance que les destinataires en échec — jamais toute la campagne (§8). */
    public function retryFailed(MarketingCampaign $campaign): JsonResponse
    {
        $this->authorize('create', MarketingCampaign::class);

        if (! in_array($campaign->status, [CampaignStatus::Completed->value, CampaignStatus::Failed->value], true)) {
            abort(409, 'Seule une campagne terminée peut être relancée sur ses échecs.');
        }

        $failedIds = MarketingCampaignRecipient::query()
            ->where('campaign_id', $campaign->id)
            ->where('status', MarketingCampaignRecipient::STATUS_FAILED)
            ->pluck('id');

        if ($failedIds->isEmpty()) {
            return MarketingCampaignResource::make($campaign)->response();
        }

        MarketingCampaignRecipient::query()->whereIn('id', $failedIds)->update(['status' => MarketingCampaignRecipient::STATUS_PENDING, 'error' => null]);
        $campaign->forceFill(['status' => CampaignStatus::InProgress->value, 'failed_count' => 0])->save();

        $jobs = $failedIds->values()->map(
            fn (int $recipientId, int $index): SendMarketingCampaignEmailJob => (new SendMarketingCampaignEmailJob($recipientId))->delay(now()->addSeconds($index)),
        )->all();

        Bus::batch($jobs)
            ->name('Campagne marketing #'.$campaign->id.' (relance échecs)')
            ->finally(function (Batch $batch) use ($campaign): void {
                $current = MarketingCampaign::find($campaign->id);

                if ($current === null || $current->status === CampaignStatus::Cancelled->value) {
                    return;
                }

                $current->forceFill(['status' => CampaignStatus::Completed->value, 'completed_at' => now()])->save();
            })
            ->dispatch();

        return MarketingCampaignResource::make($campaign->fresh())->response();
    }

    /** Duplique une campagne en nouveau brouillon — sans ses destinataires ni ses statistiques (§8). */
    public function duplicate(MarketingCampaign $campaign): JsonResponse
    {
        $this->authorize('create', MarketingCampaign::class);

        $copy = MarketingCampaign::query()->create([
            'name' => $campaign->name.' (copie)',
            'subject' => $campaign->subject,
            'sender_name' => $campaign->sender_name,
            'sender_email' => $campaign->sender_email,
            'content' => $campaign->content,
            'audience_type' => $campaign->audience_type,
            'audience_client_ids' => $campaign->audience_client_ids,
            'status' => CampaignStatus::Draft->value,
            'recipients_count' => 0,
            'sent_count' => 0,
            'failed_count' => 0,
            'created_by_user_id' => request()->user()?->id,
        ]);

        return MarketingCampaignResource::make($copy)->response()->setStatusCode(201);
    }

    public function recipients(Request $request, MarketingCampaign $campaign): JsonResponse
    {
        $this->authorize('viewAny', MarketingCampaign::class);

        $recipients = $campaign->recipients()
            ->with('client.user')
            ->latest()
            ->paginate(perPage: min((int) $request->integer('perPage', 50), 200));

        return MarketingCampaignRecipientResource::collection($recipients)->response();
    }
}
