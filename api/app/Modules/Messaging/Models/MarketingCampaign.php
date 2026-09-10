<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Models;

use App\Models\User;
use App\Modules\Messaging\Enums\CampaignAudience;
use App\Modules\Messaging\Enums\CampaignStatus;
use Database\Factories\Messaging\MarketingCampaignFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('marketing_campaigns')]
#[Fillable([
    'name', 'subject', 'sender_name', 'sender_email', 'content',
    'audience_type', 'audience_client_ids', 'status', 'recipients_count',
    'sent_count', 'failed_count', 'batch_id', 'created_by_user_id',
    'scheduled_at', 'started_at', 'completed_at',
])]
class MarketingCampaign extends Model
{
    /** @use HasFactory<MarketingCampaignFactory> */
    use HasFactory;

    /**
     * @return HasMany<MarketingCampaignRecipient, $this>
     */
    public function recipients(): HasMany
    {
        return $this->hasMany(MarketingCampaignRecipient::class, 'campaign_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /** Seul un brouillon (ou un échec) peut être (ré)envoyé — jamais une campagne déjà en cours ou terminée. */
    public function sendable(): bool
    {
        return in_array($this->status, [CampaignStatus::Draft->value, CampaignStatus::Failed->value], true);
    }

    protected static function newFactory(): MarketingCampaignFactory
    {
        return MarketingCampaignFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'audience_type' => CampaignAudience::class,
            'audience_client_ids' => 'array',
            'scheduled_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
