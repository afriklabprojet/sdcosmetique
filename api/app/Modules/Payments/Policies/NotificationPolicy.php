<?php

declare(strict_types=1);

namespace App\Modules\Payments\Policies;

use App\Models\User;
use App\Modules\Payments\Models\Payment\Notification;

class NotificationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator();
    }

    public function view(User $user, Notification $notification): bool
    {
        return $user->administrator();
    }
}
