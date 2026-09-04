<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            \Database\Seeders\Identity\AdminSeeder::class,
            \Database\Seeders\Catalog\V1CategorySeeder::class,
            \Database\Seeders\Catalog\ToneSeeder::class,
            \Database\Seeders\Content\PageSeeder::class,
            \Database\Seeders\Content\BannerSeeder::class,
            \Database\Seeders\Orders\DeliveryMethodSeeder::class,
            \Database\Seeders\Settings\SettingsSeeder::class,
            \Database\Seeders\Quiz\QuizSeeder::class,
        ]);

        if (! app()->isProduction()) {
            $this->call(\Database\Seeders\Catalog\V1CatalogSeeder::class);
        }
    }
}
