<?php

declare(strict_types=1);

namespace Database\Factories\Pos;

use App\Models\User;
use App\Modules\Pos\Models\AuditLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AuditLog>
 */
class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'action' => AuditLog::SALE_CREATED,
            'auditable_type' => 'App\\Modules\\Orders\\Models\\Order',
            'auditable_id' => fake()->numberBetween(1, 1000),
            'created_at' => now(),
        ];
    }
}
