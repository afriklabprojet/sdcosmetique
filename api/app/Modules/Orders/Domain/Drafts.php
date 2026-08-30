<?php

declare(strict_types=1);

namespace App\Modules\Orders\Domain;

use App\Modules\Orders\Models\Order;
use App\Modules\Shopping\Models\Cart;

class Drafts
{
    /**
     * Re-point guest checkout drafts onto the surviving client cart (SEC-11 / D39).
     * If the survivor already has a draft, the guest draft is discarded to honour cart_id uniqueness.
     */
    public static function adopt(Cart $guest, Cart $survivor): void
    {
        $guestDrafts = Order::query()
            ->where('cart_id', $guest->id)
            ->whereNull('placed_at')
            ->get();

        if ($guestDrafts->isEmpty()) {
            return;
        }

        $survivorDraft = Order::query()
            ->where('cart_id', $survivor->id)
            ->whereNull('placed_at')
            ->first();

        foreach ($guestDrafts as $draft) {
            if ($survivorDraft === null) {
                $draft->repoint($survivor);
                $survivorDraft = $draft;

                continue;
            }

            $draft->delete();
        }
    }
}
