<?php

declare(strict_types=1);

namespace Database\Factories\Pos;

use App\Modules\Orders\Models\Order\Item as OrderItem;
use App\Modules\Pos\Models\Refund;
use App\Modules\Pos\Models\Refund\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Item>
 */
class RefundItemFactory extends Factory
{
    protected $model = Item::class;

    public function definition(): array
    {
        return [
            'pos_refund_id' => Refund::factory(),
            'order_item_id' => OrderItem::factory(),
            'quantity' => 1,
            'amount' => 1_000,
        ];
    }
}
