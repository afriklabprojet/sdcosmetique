<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Events;

use App\Modules\Shopping\Models\Cart;

/**
 * Fired inside Cart::merge() before the guest cart is deleted,
 * so Orders can re-point an in-flight draft (SEC-11 / D39).
 */
final class GuestCartMerged
{
    public function __construct(
        public readonly Cart $guest,
        public readonly Cart $survivor,
    ) {}
}
