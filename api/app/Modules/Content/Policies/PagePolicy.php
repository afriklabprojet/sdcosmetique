<?php

declare(strict_types=1);

namespace App\Modules\Content\Policies;

use App\Models\User;
use App\Modules\Content\Models\Page;

class PagePolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Page $page): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->administrator();
    }

    public function update(User $user, Page $page): bool
    {
        return $user->administrator();
    }

    public function delete(User $user, Page $page): bool
    {
        return $user->administrator();
    }
}
