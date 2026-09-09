<?php

declare(strict_types=1);

namespace Database\Factories\Identity;

use App\Models\User;
use App\Modules\Identity\Models\LoginOtp;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<LoginOtp>
 */
class LoginOtpFactory extends Factory
{
    protected $model = LoginOtp::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'code_hash' => Hash::make('482917'),
            'expires_at' => now()->addMinutes(10),
            'used_at' => null,
        ];
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes): array => [
            'expires_at' => now()->subMinute(),
        ]);
    }

    public function used(): static
    {
        return $this->state(fn (array $attributes): array => [
            'used_at' => now(),
        ]);
    }
}
