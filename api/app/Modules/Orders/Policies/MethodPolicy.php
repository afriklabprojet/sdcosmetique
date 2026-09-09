<?php

declare(strict_types=1);

namespace App\Modules\Orders\Policies;

use App\Models\User;
use App\Modules\Orders\Models\Delivery\Method;

class MethodPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Method $method): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->administrator();
    }

    public function update(User $user, Method $method): bool
    {
        return $user->administrator();
    }

    public function delete(User $user, Method $method): bool
    {
        return $user->administrator();
    }
}
