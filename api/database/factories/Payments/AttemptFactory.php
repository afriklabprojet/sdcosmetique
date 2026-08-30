<?php

declare(strict_types=1);

namespace Database\Factories\Payments;

use App\Modules\Payments\Models\Payment;
use App\Modules\Payments\Models\Payment\Attempt;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Attempt>
 */
class AttemptFactory extends Factory
{
    protected $model = Attempt::class;

    public function definition(): array
    {
        return [
            'payment_id' => Payment::factory(),
            'gateway' => 'null',
            'reference' => strtoupper((string) Str::ulid()),
            'amount' => 27000,
            'currency' => 'XOF',
            'initiated_at' => now(),
        ];
    }
}
