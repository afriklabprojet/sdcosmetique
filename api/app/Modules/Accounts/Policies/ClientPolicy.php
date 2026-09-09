<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Policies;

use App\Models\User;
use App\Modules\Accounts\Models\Client;

class ClientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator();
    }

    public function view(User $user, Client $client): bool
    {
        return $user->administrator();
    }
}
