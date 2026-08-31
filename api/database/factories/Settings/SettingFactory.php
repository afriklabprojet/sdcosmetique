<?php

declare(strict_types=1);

namespace Database\Factories\Settings;

use App\Modules\Settings\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Setting>
 */
class SettingFactory extends Factory
{
    protected $model = Setting::class;

    public function definition(): array
    {
        return [
            'key' => fake()->unique()->slug(2),
            'value' => ['label' => fake()->words(3, true)],
            'is_public' => true,
            'updated_at' => now(),
        ];
    }

    public function private(): static
    {
        return $this->state(fn (): array => ['is_public' => false]);
    }
}
