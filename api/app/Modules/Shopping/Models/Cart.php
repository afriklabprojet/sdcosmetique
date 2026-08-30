<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Models;

use App\Modules\Accounts\Models\Client;
use App\Modules\Catalog\Models\Product;
use App\Modules\Shopping\Events\GuestCartMerged;
use App\Shared\Money;
use Database\Factories\Shopping\CartFactory;
use DomainException;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

#[Table('carts')]
#[Fillable(['client_id', 'coupon_id', 'guest_token'])]
class Cart extends Model
{
    /** @use HasFactory<CartFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return BelongsTo<Coupon, $this>
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * @return HasMany<Cart\Item, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(Cart\Item::class);
    }

    public static function current(?Client $client, ?string $guestToken): self
    {
        if ($client instanceof Client) {
            return self::query()->firstOrCreate(['client_id' => $client->id]);
        }

        if (! is_string($guestToken) || $guestToken === '') {
            throw new DomainException('A guest token is required.');
        }

        return self::query()->firstOrCreate(['guest_token' => $guestToken]);
    }

    public function add(Product $product, int $quantity): Cart\Item
    {
        if ($quantity < 1) {
            throw new DomainException('Quantity must be at least 1.');
        }

        if (! $product->sellable()) {
            $child = $product->child();
            if ($child === null) {
                throw new DomainException('Product is not sellable.');
            }
            $product = $child;
        }

        $item = $this->items()->where('product_id', $product->id)->first();

        if ($item !== null) {
            $item->increment('quantity', $quantity);

            return $item->refresh();
        }

        return $this->items()->create([
            'product_id' => $product->id,
            'quantity' => $quantity,
        ]);
    }

    public function merge(self $guest): void
    {
        if ($this->is($guest)) {
            return;
        }

        DB::transaction(function () use ($guest): void {
            $guest->load(['items.product']);

            foreach ($guest->items as $item) {
                $this->add($item->product, $item->quantity);
            }

            if ($this->coupon_id === null && $guest->coupon_id !== null) {
                $this->forceFill(['coupon_id' => $guest->coupon_id])->save();
            }

            // Orders listens and re-points the draft before the guest cart row disappears (SEC-11).
            event(new GuestCartMerged($guest, $this));

            $guest->items()->delete();
            $guest->delete();
        });
    }

    public function clear(): void
    {
        $this->items()->delete();
        $this->forceFill(['coupon_id' => null])->save();
    }

    public function subtotal(): Money
    {
        $amount = $this->items()->with('product')->get()->sum(
            fn (Cart\Item $item): int => $item->product->pricing()->unit() * $item->quantity,
        );

        return new Money((int) $amount);
    }

    public function discount(): Money
    {
        if ($this->coupon === null) {
            return new Money(0);
        }

        return $this->coupon->discount($this->subtotal());
    }

    public function total(): Money
    {
        return $this->subtotal()->subtract($this->discount());
    }

    protected static function newFactory(): CartFactory
    {
        return CartFactory::new();
    }
}
