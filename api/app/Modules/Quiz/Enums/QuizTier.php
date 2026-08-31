<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Enums;

enum QuizTier: string
{
    case Essential = 'essential';
    case Complementary = 'complementary';
    case RoutineKit = 'routine_kit';
}
