<?php

declare(strict_types=1);

namespace App\Modules\Orders\Policies;

use App\Models\User;
use App\Modules\Orders\Models\Order;
use Illuminate\Support\Str;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator() || $user->client !== null;
    }

    /**
     * Une commande "invité" (sans compte) n'exige pas d'authentification pour
     * être consultée — mais exige alors l'e-mail de la commande en second
     * facteur. Indispensable depuis que la référence est courte et
     * séquentielle (CMD-2026-000123) : avant, une référence aléatoire sur
     * 32^10 combinaisons suffisait comme secret de facto ; une suite
     * énumérable ne suffit plus à elle seule à protéger les données d'un
     * client (adresse, articles, statut de paiement).
     */
    public function view(?User $user, Order $order, ?string $email = null): bool
    {
        if ($user?->administrator()) {
            return true;
        }

        if ($user?->client?->id !== null && $user->client->id === $order->client_id) {
            return true;
        }

        if (! $order->guest()) {
            return false;
        }

        $provided = Str::lower(trim((string) $email));
        $actual = Str::lower(trim((string) $order->email));

        return $provided !== '' && hash_equals($actual, $provided);
    }

    public function create(?User $user): bool
    {
        return true;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->administrator();
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->administrator();
    }
}
