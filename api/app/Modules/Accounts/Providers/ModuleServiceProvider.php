<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Providers;

use App\Modules\Accounts\Models\Address;
use App\Modules\Accounts\Policies\AddressPolicy;
use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'accounts';
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [
            Address::class => AddressPolicy::class,
        ];
    }
}
