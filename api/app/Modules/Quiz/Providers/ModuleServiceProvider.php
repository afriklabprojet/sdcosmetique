<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Providers;

use App\Modules\Quiz\Models\Question;
use App\Modules\Quiz\Models\Submission;
use App\Modules\Quiz\Policies\QuestionPolicy;
use App\Modules\Quiz\Policies\SubmissionPolicy;
use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'quiz';
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [
            Question::class => QuestionPolicy::class,
            Submission::class => SubmissionPolicy::class,
        ];
    }
}
