<?php

declare(strict_types=1);

namespace App\Modules\Orders\Policies;

use App\Models\User;
use App\Modules\Orders\Models\Order;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator() || $user->client !== null;
    }

    public function view(?User $user, Order $order): bool
    {
        if ($user?->administrator()) {
            return true;
        }

        if ($user?->client?->id !== null && $user->client->id === $order->client_id) {
            return true;
        }

        return $order->guest();
    }

    public function create(?User $user): bool
    {
        return true;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->administrator();
    }
}
