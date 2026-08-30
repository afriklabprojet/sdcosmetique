<?php

declare(strict_types=1);

namespace App\Modules\Payments\Policies;

use App\Models\User;
use App\Modules\Payments\Models\Payment;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator();
    }

    public function view(?User $user, Payment $payment): bool
    {
        if ($user?->administrator()) {
            return true;
        }

        $order = $payment->order;

        if ($user?->client?->id !== null && $user->client->id === $order->client_id) {
            return true;
        }

        return $order->guest();
    }

    public function create(?User $user): bool
    {
        return true;
    }
}
