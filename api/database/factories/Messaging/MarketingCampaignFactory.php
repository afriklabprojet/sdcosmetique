<?php

declare(strict_types=1);

namespace Database\Factories\Messaging;

use App\Modules\Messaging\Enums\CampaignAudience;
use App\Modules\Messaging\Enums\CampaignStatus;
use App\Modules\Messaging\Models\MarketingCampaign;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MarketingCampaign>
 */
class MarketingCampaignFactory extends Factory
{
    protected $model = MarketingCampaign::class;

    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'subject' => fake()->sentence(5),
            'sender_name' => 'SD Cosmétique',
            'sender_email' => 'contact@sdcosmetique.ci',
            'content' => '<p>'.fake()->paragraph().'</p>',
            'audience_type' => CampaignAudience::All,
            'status' => CampaignStatus::Draft,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (): array => [
            'status' => CampaignStatus::Completed,
            'started_at' => now()->subMinutes(10),
            'completed_at' => now(),
        ]);
    }
}
