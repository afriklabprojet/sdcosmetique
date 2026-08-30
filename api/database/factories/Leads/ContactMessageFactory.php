<?php

declare(strict_types=1);

namespace Database\Factories\Leads;

use App\Modules\Leads\Models\Contact\Message;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class ContactMessageFactory extends Factory
{
    protected $model = Message::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'subject' => fake()->sentence(4),
            'message' => fake()->paragraph(),
        ];
    }
}
