<?php

declare(strict_types=1);

namespace App\Modules\Reviews\Providers;

use App\Modules\Reviews\Models\Review;
use App\Modules\Reviews\Policies\ReviewPolicy;
use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'reviews';
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [
            Review::class => ReviewPolicy::class,
        ];
    }
}
