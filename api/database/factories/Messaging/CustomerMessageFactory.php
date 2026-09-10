<?php

declare(strict_types=1);

namespace Database\Factories\Messaging;

use App\Modules\Accounts\Models\Client;
use App\Modules\Messaging\Models\CustomerMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CustomerMessage>
 */
class CustomerMessageFactory extends Factory
{
    protected $model = CustomerMessage::class;

    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'sent_by_user_id' => null,
            'channel' => 'email',
            'subject' => fake()->sentence(4),
            'body' => fake()->paragraph(),
            'recipient_email' => fake()->safeEmail(),
            'status' => CustomerMessage::STATUS_PENDING,
        ];
    }

    public function sent(): static
    {
        return $this->state(fn (): array => [
            'status' => CustomerMessage::STATUS_SENT,
            'sent_at' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (): array => [
            'status' => CustomerMessage::STATUS_FAILED,
            'error' => 'Erreur d\'envoi simulée pour les tests.',
        ]);
    }
}
