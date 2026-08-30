<?php

declare(strict_types=1);

namespace App\Modules\Content\Providers;

use App\Modules\Content\Models\Banner;
use App\Modules\Content\Models\Page;
use App\Modules\Content\Policies\BannerPolicy;
use App\Modules\Content\Policies\PagePolicy;
use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'content';
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [
            Page::class => PagePolicy::class,
            Banner::class => BannerPolicy::class,
        ];
    }
}
