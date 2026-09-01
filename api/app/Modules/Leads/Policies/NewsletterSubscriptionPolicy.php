<?php

declare(strict_types=1);

namespace App\Modules\Leads\Policies;

use App\Models\User;
use App\Modules\Leads\Models\Newsletter\Subscription;

class NewsletterSubscriptionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator();
    }

    public function create(?User $user): bool
    {
        return true;
    }

    public function update(User $user, Subscription $subscription): bool
    {
        return $user->administrator();
    }

    public function delete(User $user, Subscription $subscription): bool
    {
        return $user->administrator();
    }
}
