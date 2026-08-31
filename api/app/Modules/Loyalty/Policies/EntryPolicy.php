<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Policies;

use App\Models\User;
use App\Modules\Loyalty\Models\Entry;

class EntryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator() || $user->client !== null;
    }

    public function view(User $user, Entry $entry): bool
    {
        return $user->administrator() || $user->client?->id === $entry->account->client_id;
    }

    public function create(User $user): bool
    {
        return $user->administrator();
    }

    public function redeem(User $user): bool
    {
        return $user->client !== null;
    }
}
