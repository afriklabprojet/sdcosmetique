<?php

declare(strict_types=1);

namespace App\Modules\Settings\Policies;

use App\Models\User;
use App\Modules\Settings\Models\Setting;

class SettingPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Setting $setting): bool
    {
        return $setting->public() || ($user?->administrator() ?? false);
    }

    public function update(User $user, Setting $setting): bool
    {
        return $user->administrator();
    }
}
