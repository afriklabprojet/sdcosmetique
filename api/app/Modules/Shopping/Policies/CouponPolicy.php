<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Policies;

use App\Models\User;
use App\Modules\Shopping\Models\Coupon;

class CouponPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator();
    }

    public function view(User $user, Coupon $coupon): bool
    {
        return $user->administrator();
    }

    public function create(User $user): bool
    {
        return $user->administrator();
    }

    public function update(User $user, Coupon $coupon): bool
    {
        return $user->administrator();
    }

    public function delete(User $user, Coupon $coupon): bool
    {
        return $user->administrator();
    }
}
