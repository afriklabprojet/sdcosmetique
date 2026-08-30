<?php

declare(strict_types=1);

namespace Database\Seeders;

use Database\Seeders\Catalog\V1CatalogSeeder;
use Database\Seeders\Catalog\V1CategorySeeder;
use Database\Seeders\Content\BannerSeeder;
use Database\Seeders\Content\PageSeeder;
use Database\Seeders\Identity\AdminSeeder;
use Database\Seeders\Orders\DeliveryMethodSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            V1CategorySeeder::class,
            V1CatalogSeeder::class,
            PageSeeder::class,
            BannerSeeder::class,
            DeliveryMethodSeeder::class,
        ]);
    }
}
