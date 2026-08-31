<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use App\Modules\Content\Models\Banner;
use App\Modules\Content\Models\Page;

it('lists visible banners', function (): void {
    Banner::factory()->create(['key' => 'home-slide-1', 'visible_at' => now(), 'order' => 1]);
    Banner::factory()->create(['key' => 'hidden', 'visible_at' => null, 'order' => 2]);

    $this->getJson('/v1/banners')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.key', 'home-slide-1');
});

it('lists featured products via the products index', function (): void {
    $category = Category::factory()->create();
    $parent = Product::factory()->parentProduct()->create(['category_id' => $category->id]);
    Product::factory()->child($parent)->create(['category_id' => $category->id]);
    $parent->badges()->create(['label' => 'FEATURED', 'type' => 'featured']);

    $plain = Product::factory()->parentProduct()->create(['category_id' => $category->id]);
    Product::factory()->child($plain)->create(['category_id' => $category->id]);

    $this->getJson('/v1/products?featured=1&perPage=8')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', $parent->slug);
});

it('lists categories and shows one by slug', function (): void {
    $category = Category::factory()->create(['slug' => 'cleansers', 'name' => 'Cleansers']);
    $parent = Product::factory()->parentProduct()->create(['category_id' => $category->id]);
    Product::factory()->child($parent)->create(['category_id' => $category->id]);

    $this->getJson('/v1/categories')->assertOk()->assertJsonPath('data.0.slug', 'cleansers');
    $this->getJson('/v1/categories/cleansers')->assertOk()->assertJsonPath('data.slug', 'cleansers');
});

it('shows a published page and 404s an unpublished one', function (): void {
    Page::factory()->create(['slug' => 'about', 'title' => 'Our story', 'published_at' => now()]);
    Page::factory()->create(['slug' => 'draft', 'published_at' => null]);

    $this->getJson('/v1/pages/about')->assertOk()->assertJsonPath('data.title', 'Our story');
    $this->getJson('/v1/pages/draft')->assertNotFound();
});
