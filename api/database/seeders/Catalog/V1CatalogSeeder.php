<?php

declare(strict_types=1);

namespace Database\Seeders\Catalog;

use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class V1CatalogSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->isProduction()) {
            return;
        }

        $path = database_path('data/v1-products.json');
        /** @var array<int, array<string, mixed>> $products */
        $products = json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR);

        Product::withoutEvents(function () use ($products): void {
            \Illuminate\Support\Facades\DB::transaction(function () use ($products): void {
                foreach ($products as $record) {
                    $category = Category::query()->where('slug', $record['category'])->firstOrFail();
                    $publishedAt = isset($record['createdAt']) ? $record['createdAt'].' 00:00:00' : now()->toDateTimeString();

                    $parent = Product::query()->updateOrCreate(
                        ['slug' => $record['slug']],
                        [
                            'category_id' => $category->id,
                            'parent_id' => null,
                            'title' => $record['title'],
                            'summary' => $record['shortDescription'] ?? null,
                            'description' => $record['description'] ?? null,
                            'ingredients' => $record['ingredients'] ?? null,
                            'usage' => $record['howToUse'] ?? null,
                            'sku' => strtoupper((string) $record['id']),
                            'label' => null,
                            'regular_price' => null,
                            'sale_price' => null,
                            'stock' => 0,
                            'visible_at' => $publishedAt,
                            'published_at' => $publishedAt,
                        ],
                    );

                    $parent->badges()->delete();
                    foreach ($record['badges'] ?? [] as $label) {
                        $parent->badges()->create([
                            'label' => $label,
                            'type' => str_contains(strtolower((string) $label), 'off') ? 'sale' : 'highlight',
                        ]);
                    }

                    if (($record['featured'] ?? false) === true) {
                        $parent->badges()->create([
                            'label' => 'Bestseller',
                            'type' => 'bestseller',
                        ]);
                    }

                    $parent->files()->delete();
                    foreach ($record['images'] ?? [] as $image) {
                        $url = self::assetPath((string) $image);
                        $parent->files()->create([
                            'disk' => 'public',
                            'path' => $url,
                            'url' => $url,
                            'mime_type' => 'image/jpeg',
                            'size' => 0,
                        ]);
                    }

                    $defaultId = $record['defaultVariantId'] ?? null;
                    $variants = $record['variants'] ?? [];
                    usort($variants, function (array $left, array $right) use ($defaultId): int {
                        if ($left['id'] === $defaultId) {
                            return -1;
                        }

                        if ($right['id'] === $defaultId) {
                            return 1;
                        }

                        return 0;
                    });

                    foreach ($variants as $variant) {
                        $compare = $variant['compareAtPrice'] ?? null;
                        $price = self::placeholderXof($variant['price']);
                        $regular = $compare === null ? $price : self::placeholderXof($compare);
                        $sale = $compare === null ? null : $price;

                        Product::query()->updateOrCreate(
                            ['sku' => strtoupper((string) $variant['id'])],
                            [
                                'category_id' => $category->id,
                                'parent_id' => $parent->id,
                                'slug' => $record['slug'].'-'.Str::slug((string) $variant['label']),
                                'title' => $record['title'],
                                'label' => $variant['label'],
                                'regular_price' => $regular,
                                'sale_price' => $sale,
                                'stock' => (int) $variant['stock'],
                                'visible_at' => $publishedAt,
                                'published_at' => $publishedAt,
                            ],
                        );
                    }
                }
            });
        });
    }

    private static function assetPath(string $path): string
    {
        return str_starts_with($path, '/') ? $path : '/'.$path;
    }

    private static function placeholderXof(mixed $value): int
    {
        return (int) $value;
    }
}
