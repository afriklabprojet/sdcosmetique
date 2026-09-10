<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Models;

use App\Modules\Accounts\Models\Client;
use Database\Factories\Messaging\MarketingCampaignRecipientFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('marketing_campaign_recipients')]
#[Fillable(['campaign_id', 'client_id', 'email', 'status', 'error', 'sent_at'])]
class MarketingCampaignRecipient extends Model
{
    /** @use HasFactory<MarketingCampaignRecipientFactory> */
    use HasFactory;

    public const string STATUS_PENDING = 'pending';

    public const string STATUS_SENT = 'sent';

    public const string STATUS_FAILED = 'failed';

    public const string STATUS_SKIPPED_UNSUBSCRIBED = 'skipped_unsubscribed';

    /**
     * @return BelongsTo<MarketingCampaign, $this>
     */
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(MarketingCampaign::class, 'campaign_id');
    }

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    protected static function newFactory(): MarketingCampaignRecipientFactory
    {
        return MarketingCampaignRecipientFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
        ];
    }
}
