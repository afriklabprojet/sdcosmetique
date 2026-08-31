<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Enums;

enum QuestionType: string
{
    case SingleChoice = 'single_choice';
    case MultiChoice = 'multi_choice';
    case ColorPicker = 'color_picker';
}
