<?php

declare(strict_types=1);

namespace App\Modules\Leads\Policies;

use App\Models\User;
use App\Modules\Leads\Models\Contact\Message;

class ContactMessagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator();
    }

    public function view(User $user, Message $message): bool
    {
        return $user->administrator();
    }

    public function create(?User $user): bool
    {
        return true;
    }

    public function update(User $user, Message $message): bool
    {
        return $user->administrator();
    }
}
