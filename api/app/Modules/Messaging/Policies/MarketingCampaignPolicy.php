<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Policies;

use App\Models\User;

class MarketingCampaignPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator();
    }

    public function create(User $user): bool
    {
        return $user->administrator();
    }
}
