<?php

declare(strict_types=1);

namespace Database\Factories\Payments;

use App\Modules\Payments\Models\Payment\Notification;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'gateway' => 'null',
            'reference' => strtoupper((string) Str::ulid()),
            'payload' => ['raw' => true],
        ];
    }
}
