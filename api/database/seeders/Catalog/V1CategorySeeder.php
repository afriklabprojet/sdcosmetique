<?php

declare(strict_types=1);

namespace Database\Seeders\Catalog;

use App\Modules\Catalog\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class V1CategorySeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/v1-categories.json');
        /** @var array<int, array<string, mixed>> $categories */
        $categories = json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR);

        Category::withoutEvents(function () use ($categories): void {
            \Illuminate\Support\Facades\DB::transaction(function () use ($categories): void {
                foreach ($categories as $index => $category) {
                    Category::query()->updateOrCreate(
                        ['slug' => $category['slug']],
                        [
                            'name' => $category['name'],
                            'description' => $category['description'],
                            'image' => self::assetPath((string) $category['image']),
                            'banner' => self::assetPath((string) $category['banner']),
                            'order' => $index,
                        ],
                    );
                }
            });
        });
    }

    private static function assetPath(string $path): string
    {
        return str_starts_with($path, '/') ? $path : '/'.$path;
    }
}
