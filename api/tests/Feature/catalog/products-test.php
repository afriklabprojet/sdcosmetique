<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;

it('lists published parent products nine per page', function (): void {
    $category = Category::factory()->create(['slug' => 'cleansers']);

    foreach (range(1, 12) as $index) {
        $parent = Product::factory()->parentProduct()->create([
            'category_id' => $category->id,
            'title' => 'Product '.$index,
            'published_at' => now()->subDays(12 - $index),
        ]);
        Product::factory()->child($parent)->create([
            'category_id' => $category->id,
            'regular_price' => 10 * $index,
            'sale_price' => null,
            'stock' => 3,
        ]);
    }

    $this->getJson('/v1/products')
        ->assertOk()
        ->assertJsonPath('meta.per_page', 9)
        ->assertJsonPath('meta.total', 12)
        ->assertJsonCount(9, 'data');
});

it('sorts by name ascending', function (): void {
    $category = Category::factory()->create();
    foreach (['Zulu cream', 'Alpha gel'] as $title) {
        $parent = Product::factory()->parentProduct()->create([
            'category_id' => $category->id,
            'title' => $title,
        ]);
        Product::factory()->child($parent)->create(['category_id' => $category->id]);
    }

    $this->getJson('/v1/products?sort=name-asc')
        ->assertOk()
        ->assertJsonPath('data.0.title', 'Alpha gel')
        ->assertJsonPath('data.1.title', 'Zulu cream');
});

it('filters by category slug, search and in-stock', function (): void {
    $cleansers = Category::factory()->create(['slug' => 'cleansers', 'name' => 'Cleansers']);
    $toners = Category::factory()->create(['slug' => 'toners', 'name' => 'Toners']);

    $match = Product::factory()->parentProduct()->create([
        'category_id' => $cleansers->id,
        'title' => 'Hydraglow Daily Gel Cleanser',
        'summary' => 'A weightless gel',
    ]);
    Product::factory()->child($match)->create(['category_id' => $cleansers->id, 'stock' => 5]);

    $other = Product::factory()->parentProduct()->create([
        'category_id' => $toners->id,
        'title' => 'Rose Toner',
    ]);
    Product::factory()->child($other)->create(['category_id' => $toners->id, 'stock' => 0]);

    $this->getJson('/v1/products?category=cleansers&q=hydraglow&availability=in-stock')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.slug', $match->slug);
});

it('returns a product with related items and 404s for missing slugs', function (): void {
    $category = Category::factory()->create(['slug' => 'cleansers']);
    $parent = Product::factory()->parentProduct()->create([
        'category_id' => $category->id,
        'slug' => 'hydraglow-daily-gel-cleanser',
        'title' => 'Hydraglow Daily Gel Cleanser',
    ]);
    Product::factory()->child($parent)->create(['category_id' => $category->id, 'label' => '30ml']);

    $this->getJson('/v1/products/hydraglow-daily-gel-cleanser')
        ->assertOk()
        ->assertJsonPath('data.title', 'Hydraglow Daily Gel Cleanser')
        ->assertJsonPath('data.children.0.label', '30ml');

    $this->getJson('/v1/products/does-not-exist')->assertNotFound();
});

it('accepts every V1 sort key and orders by price', function (): void {
    $category = Category::factory()->create();
    $cheap = Product::factory()->parentProduct()->create([
        'category_id' => $category->id,
        'title' => 'Cheap gel',
    ]);
    Product::factory()->child($cheap)->create([
        'category_id' => $category->id,
        'regular_price' => 10,
        'sale_price' => null,
    ]);
    $dear = Product::factory()->parentProduct()->create([
        'category_id' => $category->id,
        'title' => 'Dear cream',
    ]);
    Product::factory()->child($dear)->create([
        'category_id' => $category->id,
        'regular_price' => 90,
        'sale_price' => null,
    ]);

    foreach (['featured', 'price-asc', 'price-desc', 'newest', 'rating', 'name-asc'] as $sort) {
        $this->getJson('/v1/products?sort='.$sort)->assertOk();
    }

    $this->getJson('/v1/products?sort=price-asc')
        ->assertOk()
        ->assertJsonPath('data.0.title', 'Cheap gel')
        ->assertJsonPath('data.1.title', 'Dear cream');

    $this->getJson('/v1/products?sort=price-desc')
        ->assertOk()
        ->assertJsonPath('data.0.title', 'Dear cream');
});
