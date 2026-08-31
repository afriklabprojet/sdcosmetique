<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Policies;

use App\Models\User;
use App\Modules\Quiz\Models\Question;

class QuestionPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Question $question): bool
    {
        return ! $question->archived() || ($user?->administrator() ?? false);
    }

    public function create(User $user): bool
    {
        return $user->administrator();
    }

    public function update(User $user, Question $question): bool
    {
        return $user->administrator();
    }

    public function delete(User $user, Question $question): bool
    {
        return $user->administrator();
    }
}
