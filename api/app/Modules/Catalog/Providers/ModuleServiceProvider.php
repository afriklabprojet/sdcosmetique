<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Providers;

use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Policies\CategoryPolicy;
use App\Modules\Catalog\Policies\ProductPolicy;
use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'catalog';
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [
            Product::class => ProductPolicy::class,
            Category::class => CategoryPolicy::class,
        ];
    }
}
