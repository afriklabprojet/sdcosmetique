<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Policies;

use App\Models\User;
use App\Modules\Quiz\Models\Submission;

class SubmissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator();
    }

    public function view(?User $user, Submission $submission): bool
    {
        return true;
    }

    public function create(?User $user): bool
    {
        return true;
    }
}
