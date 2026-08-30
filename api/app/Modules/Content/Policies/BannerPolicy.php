<?php

declare(strict_types=1);

namespace App\Modules\Content\Policies;

use App\Models\User;
use App\Modules\Content\Models\Banner;

class BannerPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Banner $banner): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->administrator();
    }

    public function update(User $user, Banner $banner): bool
    {
        return $user->administrator();
    }

    public function delete(User $user, Banner $banner): bool
    {
        return $user->administrator();
    }
}
