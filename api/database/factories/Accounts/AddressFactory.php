<?php

declare(strict_types=1);

namespace Database\Factories\Accounts;

use App\Modules\Accounts\Models\Address;
use App\Modules\Accounts\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Address>
 */
class AddressFactory extends Factory
{
    protected $model = Address::class;

    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'line_1' => fake()->streetAddress(),
            'city' => 'Abidjan',
            'country' => 'CI',
            'phone' => fake()->numerify('+225########'),
        ];
    }
}
