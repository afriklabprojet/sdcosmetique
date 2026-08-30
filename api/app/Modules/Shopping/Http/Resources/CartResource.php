<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Http\Resources;

use App\Modules\Catalog\Http\Resources\ProductResource;
use App\Modules\Shopping\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Cart
 */
class CartResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->loadMissing([
            'items.product.parent.children',
            'items.product.parent.category',
            'items.product.parent.files',
            'items.product.parent.badges',
            'items.product.category',
            'items.product.files',
            'items.product.badges',
            'coupon',
        ]);

        $subtotal = $this->subtotal();
        $discount = $this->discount();
        $total = $this->total();
        $threshold = (int) config('shopping.free_shipping_threshold', 49);
        $remaining = max(0, $threshold - $total->value);
        $progress = $threshold === 0 ? 100 : min(100, (int) floor(($total->value * 100) / $threshold));

        return [
            'guest_token' => $this->guest_token,
            'items' => $this->items->map(fn ($item): array => [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'line_total' => $item->product->pricing()->unit() * $item->quantity,
                'product' => (new ProductResource($item->product->parent_id ? $item->product->parent : $item->product))->resolve(),
                'child' => [
                    'slug' => $item->product->slug,
                    'sku' => $item->product->sku,
                    'label' => $item->product->label,
                    'price' => $item->product->pricing()->unit(),
                ],
            ])->values(),
            'coupon' => $this->coupon === null ? null : [
                'code' => $this->coupon->code,
            ],
            'subtotal' => $subtotal->value,
            'discount' => $discount->value,
            'total' => $total->value,
            'currency' => 'XOF',
            'free_shipping' => [
                'threshold' => $threshold,
                'remaining' => $remaining,
                'progress' => $progress,
                'unlocked' => $remaining === 0,
            ],
        ];
    }
}
