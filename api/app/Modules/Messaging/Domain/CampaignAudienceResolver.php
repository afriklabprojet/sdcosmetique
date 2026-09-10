<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Domain;

use App\Modules\Accounts\Models\Client;
use App\Modules\Messaging\Enums\CampaignAudience;
use App\Modules\Messaging\Models\MarketingCampaign;
use Illuminate\Database\Eloquent\Builder;

/**
 * Résout la liste des clients ciblés par une campagne (§6) — utilisé à la
 * fois pour le compteur "Nombre de destinataires" en direct pendant la
 * composition et pour la création réelle des lignes destinataire à l'envoi.
 * Exclut toujours les désabonnés marketing (§9) et ne renvoie jamais un
 * client sans e-mail exploitable.
 */
class CampaignAudienceResolver
{
    /** Nombre de jours sans commande au-delà duquel un client est considéré "inactif". */
    public const int INACTIVE_AFTER_DAYS = 90;

    /**
     * @return Builder<Client>
     */
    public static function query(CampaignAudience $audience, ?array $manualClientIds = null): Builder
    {
        $query = Client::query()
            ->whereHas('user', fn ($q) => $q->whereNotNull('email')->where('email', '!=', ''))
            ->where('marketing_opt_in', true);

        return match ($audience) {
            CampaignAudience::All => $query,
            CampaignAudience::Ordered => $query->whereHas('orders', fn ($q) => $q->whereNotNull('placed_at')),
            CampaignAudience::NeverOrdered => $query->whereDoesntHave('orders', fn ($q) => $q->whereNotNull('placed_at')),
            CampaignAudience::Active => $query->whereHas(
                'orders',
                fn ($q) => $q->whereNotNull('placed_at')->where('placed_at', '>=', now()->subDays(self::INACTIVE_AFTER_DAYS)),
            ),
            CampaignAudience::Inactive => $query
                ->whereHas('orders', fn ($q) => $q->whereNotNull('placed_at'))
                ->whereDoesntHave(
                    'orders',
                    fn ($q) => $q->whereNotNull('placed_at')->where('placed_at', '>=', now()->subDays(self::INACTIVE_AFTER_DAYS)),
                ),
            CampaignAudience::Manual => $query->whereIn('id', $manualClientIds ?? []),
        };
    }

    public static function count(CampaignAudience $audience, ?array $manualClientIds = null): int
    {
        return self::query($audience, $manualClientIds)->count();
    }

    /**
     * @return Builder<Client>
     */
    public static function forCampaign(MarketingCampaign $campaign): Builder
    {
        return self::query($campaign->audience_type, $campaign->audience_client_ids);
    }
}
