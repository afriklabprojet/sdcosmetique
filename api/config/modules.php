<?php

declare(strict_types=1);

use App\Modules\Accounts\Providers\ModuleServiceProvider as AccountsServiceProvider;
use App\Modules\Catalog\Providers\ModuleServiceProvider as CatalogServiceProvider;
use App\Modules\Content\Providers\ModuleServiceProvider as ContentServiceProvider;
use App\Modules\Identity\Providers\ModuleServiceProvider as IdentityServiceProvider;
use App\Modules\Leads\Providers\ModuleServiceProvider as LeadsServiceProvider;
use App\Modules\Orders\Providers\ModuleServiceProvider as OrdersServiceProvider;
use App\Modules\Payments\Providers\ModuleServiceProvider as PaymentsServiceProvider;
use App\Modules\Reviews\Providers\ModuleServiceProvider as ReviewsServiceProvider;
use App\Modules\Settings\Providers\ModuleServiceProvider as SettingsServiceProvider;
use App\Modules\Shopping\Providers\ModuleServiceProvider as ShoppingServiceProvider;
use App\Modules\Testimonials\Providers\ModuleServiceProvider as TestimonialsServiceProvider;

return [
    'enabled' => [
        IdentityServiceProvider::class,
        CatalogServiceProvider::class,
        ContentServiceProvider::class,
        LeadsServiceProvider::class,
        AccountsServiceProvider::class,
        ShoppingServiceProvider::class,
        OrdersServiceProvider::class,
        PaymentsServiceProvider::class,
        SettingsServiceProvider::class,
        TestimonialsServiceProvider::class,
        ReviewsServiceProvider::class,
    ],
];
