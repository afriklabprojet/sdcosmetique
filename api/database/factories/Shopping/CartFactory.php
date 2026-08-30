<?php

declare(strict_types=1);

namespace Database\Factories\Shopping;

use App\Modules\Shopping\Models\Cart;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Cart>
 */
class CartFactory extends Factory
{
    protected $model = Cart::class;

    public function definition(): array
    {
        return [
            'guest_token' => Str::uuid()->toString(),
        ];
    }
}
