<?php

declare(strict_types=1);

namespace App\Modules\Identity\Policies;

use App\Models\User;
use App\Modules\Identity\Models\Admin;

class AdminPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->admin()?->root() ?? false;
    }

    public function view(User $user, Admin $admin): bool
    {
        return $user->administrator();
    }

    public function update(User $user, Admin $admin): bool
    {
        return $user->admin()?->root() ?? false;
    }
}
