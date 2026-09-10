<?php

declare(strict_types=1);

namespace App\Modules\Invoicing\Providers;

use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'invoicing';
    }
}
