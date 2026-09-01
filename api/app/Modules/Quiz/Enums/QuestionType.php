<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Enums;

enum QuestionType: string
{
    use \ArchTech\Enums\InvokableCases;
    use \ArchTech\Enums\Names;
    use \ArchTech\Enums\Options;
    use \ArchTech\Enums\Values;

    case SingleChoice = 'single_choice';
    case MultiChoice = 'multi_choice';
    case ColorPicker = 'color_picker';
}
