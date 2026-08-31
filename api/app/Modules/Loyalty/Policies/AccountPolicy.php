<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Policies;

use App\Models\User;
use App\Modules\Loyalty\Models\Account;

class AccountPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator();
    }

    public function view(User $user, Account $account): bool
    {
        return $user->administrator() || $user->client?->id === $account->client_id;
    }

    public function create(User $user): bool
    {
        return $user->administrator();
    }
}
