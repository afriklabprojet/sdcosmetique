<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Policies;

use App\Models\User;
use App\Modules\Catalog\Models\Category;

class CategoryPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Category $category): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->administrator();
    }

    public function update(User $user, Category $category): bool
    {
        return $user->administrator();
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->administrator();
    }
}
