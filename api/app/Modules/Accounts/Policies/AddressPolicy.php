<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Policies;

use App\Models\User;
use App\Modules\Accounts\Models\Address;

class AddressPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator() || $user->client !== null;
    }

    public function view(User $user, Address $address): bool
    {
        return $user->administrator() || $user->client?->id === $address->client_id;
    }

    public function create(User $user): bool
    {
        return $user->administrator() || $user->client !== null;
    }

    public function update(User $user, Address $address): bool
    {
        return $user->administrator() || $user->client?->id === $address->client_id;
    }

    public function delete(User $user, Address $address): bool
    {
        return $user->administrator() || $user->client?->id === $address->client_id;
    }
}
