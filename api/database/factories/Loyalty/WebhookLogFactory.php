<?php

declare(strict_types=1);

namespace Database\Factories\Loyalty;

use App\Modules\Loyalty\Models\WebhookLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WebhookLog>
 */
class WebhookLogFactory extends Factory
{
    protected $model = WebhookLog::class;

    public function definition(): array
    {
        return [
            'reference' => fake()->unique()->uuid(),
            'payload' => ['id' => fake()->uuid(), 'status' => 'success'],
            'headers' => [],
            'status' => 'received',
            'failure_reason' => null,
            'processed_at' => null,
        ];
    }

    public function settled(): static
    {
        return $this->state(fn (): array => [
            'status' => 'settled',
            'processed_at' => now(),
        ]);
    }
}
