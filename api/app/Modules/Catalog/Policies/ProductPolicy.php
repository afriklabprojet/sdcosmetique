<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Policies;

use App\Models\User;
use App\Modules\Catalog\Models\Product;

class ProductPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Product $product): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->administrator();
    }

    public function update(User $user, Product $product): bool
    {
        return $user->administrator();
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->administrator();
    }
}
