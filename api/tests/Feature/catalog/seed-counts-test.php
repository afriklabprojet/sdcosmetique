<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use App\Modules\Content\Models\Banner;
use App\Modules\Content\Models\Page;
use App\Modules\Identity\Models\Admin;
use App\Modules\Orders\Models\Delivery\Method;

it('seeds the V1 catalog counts and is idempotent', function (): void {
    $this->seed();

    $parents = Product::query()->whereNull('parent_id')->count();
    $children = Product::query()->whereNotNull('parent_id')->count();

    expect(Category::query()->count())->toBe(13)
        ->and($parents)->toBe(24)
        ->and($children)->toBeGreaterThanOrEqual(10)
        ->and(Page::query()->where('slug', 'about')->exists())->toBeTrue()
        ->and(Banner::query()->count())->toBe(3)
        ->and(Admin::query()->whereNotNull('root_at')->count())->toBe(1)
        ->and(Method::query()->where('slug', 'abidjan-standard-placeholder')->exists())->toBeTrue();

    $this->seed();

    expect(Product::query()->whereNull('parent_id')->count())->toBe(24)
        ->and(Category::query()->count())->toBe(13)
        ->and(Banner::query()->count())->toBe(3);
});
