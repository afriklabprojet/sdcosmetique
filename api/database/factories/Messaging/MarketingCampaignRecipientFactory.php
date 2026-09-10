<?php

declare(strict_types=1);

namespace Database\Factories\Messaging;

use App\Modules\Accounts\Models\Client;
use App\Modules\Messaging\Models\MarketingCampaign;
use App\Modules\Messaging\Models\MarketingCampaignRecipient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MarketingCampaignRecipient>
 */
class MarketingCampaignRecipientFactory extends Factory
{
    protected $model = MarketingCampaignRecipient::class;

    public function definition(): array
    {
        return [
            'campaign_id' => MarketingCampaign::factory(),
            'client_id' => Client::factory(),
            'email' => fake()->safeEmail(),
            'status' => MarketingCampaignRecipient::STATUS_PENDING,
        ];
    }

    public function sent(): static
    {
        return $this->state(fn (): array => ['status' => MarketingCampaignRecipient::STATUS_SENT, 'sent_at' => now()]);
    }

    public function failed(): static
    {
        return $this->state(fn (): array => ['status' => MarketingCampaignRecipient::STATUS_FAILED, 'error' => 'Erreur simulée.']);
    }
}
