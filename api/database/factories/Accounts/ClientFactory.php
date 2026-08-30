<?php

declare(strict_types=1);

namespace Database\Factories\Accounts;

use App\Models\User;
use App\Modules\Accounts\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'phone' => fake()->numerify('+225########'),
        ];
    }
}
