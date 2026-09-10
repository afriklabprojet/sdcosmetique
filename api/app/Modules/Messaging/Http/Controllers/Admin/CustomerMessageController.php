<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendCustomerMessageJob;
use App\Modules\Accounts\Models\Client;
use App\Modules\Messaging\Http\Requests\Admin\StoreCustomerMessageRequest;
use App\Modules\Messaging\Http\Resources\Admin\CustomerMessageResource;
use App\Modules\Messaging\Models\CustomerMessage;
use App\Shared\Html\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerMessageController extends Controller
{
    /** Messages > Messages envoyés (§11) — filtrable par client pour l'historique de la fiche client (§4). */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CustomerMessage::class);

        $messages = CustomerMessage::query()
            ->with(['client.user', 'sentBy'])
            ->when($request->filled('client_id'), fn ($query) => $query->where('client_id', $request->integer('client_id')))
            ->latest()
            ->paginate(perPage: min((int) $request->integer('perPage', 20), 100));

        return CustomerMessageResource::collection($messages)->response();
    }

    public function show(CustomerMessage $customerMessage): JsonResponse
    {
        $this->authorize('viewAny', CustomerMessage::class);

        $customerMessage->load(['client.user', 'sentBy']);

        return CustomerMessageResource::make($customerMessage)->response();
    }

    /** « Envoyer un message » depuis la fiche client (§5) ou « Nouveau message » (§10) — même point d'entrée. */
    public function store(StoreCustomerMessageRequest $request, Client $client): JsonResponse
    {
        $this->authorize('create', CustomerMessage::class);

        $client->loadMissing('user');
        $recipient = $client->user?->email;

        if ($recipient === null || $recipient === '') {
            abort(422, "Ce client n'a pas d'adresse e-mail.");
        }

        $message = CustomerMessage::query()->create([
            'client_id' => $client->id,
            'sent_by_user_id' => $request->user()->id,
            'channel' => 'email',
            'subject' => $request->string('subject')->toString(),
            'body' => HtmlSanitizer::clean($request->string('body')->toString()),
            'recipient_email' => $recipient,
            'status' => CustomerMessage::STATUS_PENDING,
        ]);

        SendCustomerMessageJob::dispatch($message->id)->afterCommit();

        return CustomerMessageResource::make($message)->response()->setStatusCode(201);
    }

    /** « Renvoyer » (§11) — même job, sur le même enregistrement. */
    public function resend(CustomerMessage $customerMessage): JsonResponse
    {
        $this->authorize('create', CustomerMessage::class);

        $customerMessage->forceFill(['status' => CustomerMessage::STATUS_PENDING, 'error' => null])->save();

        SendCustomerMessageJob::dispatch($customerMessage->id);

        return CustomerMessageResource::make($customerMessage)->response();
    }
}
