<?php

declare(strict_types=1);

namespace App\Modules\Reviews\Policies;

use App\Models\User;
use App\Modules\Reviews\Models\Review;

class ReviewPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Review $review): bool
    {
        return $review->approved() || ($user?->administrator() ?? false);
    }

    public function create(?User $user): bool
    {
        return true;
    }

    public function update(User $user, Review $review): bool
    {
        return $user->administrator();
    }

    public function delete(User $user, Review $review): bool
    {
        return $user->administrator();
    }
}
