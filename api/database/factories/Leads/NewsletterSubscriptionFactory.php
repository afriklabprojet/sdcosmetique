<?php

declare(strict_types=1);

namespace Database\Factories\Leads;

use App\Modules\Leads\Models\Newsletter\Subscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subscription>
 */
class NewsletterSubscriptionFactory extends Factory
{
    protected $model = Subscription::class;

    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'confirmed_at' => now(),
        ];
    }
}
