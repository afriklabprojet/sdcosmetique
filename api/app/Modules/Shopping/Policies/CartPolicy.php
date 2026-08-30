<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Policies;

use App\Models\User;
use App\Modules\Shopping\Models\Cart;

class CartPolicy
{
    public function view(?User $user, Cart $cart): bool
    {
        if ($user?->administrator()) {
            return true;
        }

        if ($user?->client?->id !== null && $user->client->id === $cart->client_id) {
            return true;
        }

        return $cart->client_id === null;
    }

    public function update(?User $user, Cart $cart): bool
    {
        return $this->view($user, $cart);
    }
}
