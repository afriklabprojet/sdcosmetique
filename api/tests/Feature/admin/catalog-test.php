<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('guards catalog admin endpoints', function (): void {
    $this->getJson('/v1/admin/products')->assertUnauthorized();
    $this->getJson('/v1/admin/categories')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/v1/admin/products')->assertForbidden();
    $this->getJson('/v1/admin/categories')->assertForbidden();
});

it('performs the category lifecycle with translations', function (): void {
    $this->actingAs(admin());

    $id = $this->postJson('/v1/admin/categories', [
        'slug' => 'soins',
        'name' => 'Soins',
        'description' => 'Nos soins',
        'translations' => [
            ['locale' => 'en', 'field' => 'name', 'value' => 'Care'],
        ],
    ])->assertCreated()
        ->assertJsonPath('data.slug', 'soins')
        ->assertJsonPath('data.name', 'Soins')
        ->assertJsonPath('data.translations.0.value', 'Care')
        ->json('data.id');

    $this->putJson('/v1/admin/categories/'.$id, ['name' => 'Soins visage'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Soins visage');

    $this->deleteJson('/v1/admin/categories/'.$id)->assertNoContent();

    expect(Category::query()->count())->toBe(0);
});

it('performs the product lifecycle', function (): void {
    $category = Category::factory()->create();

    $this->actingAs(admin());

    $id = $this->postJson('/v1/admin/products', [
        'category_id' => $category->id,
        'slug' => 'creme-hydratante',
        'title' => 'Creme hydratante',
        'summary' => 'Hydrate',
        'ingredients' => ['aqua', 'glycerin'],
        'regular_price' => 15000,
        'stock' => 12,
        'published_at' => now()->toISOString(),
    ])->assertCreated()
        ->assertJsonPath('data.slug', 'creme-hydratante')
        ->assertJsonPath('data.regular_price', 15000)
        ->json('data.id');

    $this->putJson('/v1/admin/products/'.$id, ['stock' => 20])
        ->assertOk()
        ->assertJsonPath('data.stock', 20);

    $this->getJson('/v1/admin/products/'.$id)
        ->assertOk()
        ->assertJsonStructure(['data' => ['id', 'category_id', 'images', 'badges', 'children', 'translations']]);

    $this->deleteJson('/v1/admin/products/'.$id)->assertNoContent();

    expect(Product::query()->count())->toBe(0);
});

it('validates duplicate product slug', function (): void {
    $product = Product::factory()->create(['slug' => 'existing-slug']);

    $this->actingAs(admin());

    $this->postJson('/v1/admin/products', [
        'category_id' => $product->category_id,
        'slug' => 'existing-slug',
        'title' => 'Dup',
    ])->assertStatus(422)->assertJsonValidationErrors('slug');
});

it('uploads media and attaches it to a product', function (): void {
    Storage::fake('public');
    $product = Product::factory()->create();

    $this->actingAs(admin());

    $this->postJson('/v1/admin/media', [
        'product_id' => $product->id,
        'file' => UploadedFile::fake()->image('hero.jpg', 640, 480),
    ])->assertCreated()
        ->assertJsonStructure(['data' => ['id', 'url']]);

    expect($product->files()->count())->toBe(1);
});

it('creates and updates a product with images array', function (): void {
    $category = Category::factory()->create();

    $this->actingAs(admin());

    $response = $this->postJson('/v1/admin/products', [
        'category_id' => $category->id,
        'slug' => 'test-product-images',
        'title' => 'Test Product with Images',
        'images' => [
            'http://localhost:8000/storage/products/image1.jpg',
            'http://localhost:8000/storage/products/image2.jpg',
        ],
    ])->assertCreated();

    $id = $response->json('data.id');
    $product = Product::query()->findOrFail($id);
    expect($product->files()->count())->toBe(2);
    expect($response->json('data.images.0.url'))->toBe('http://localhost:8000/storage/products/image1.jpg');

    $this->putJson('/v1/admin/products/'.$id, [
        'category_id' => $category->id,
        'slug' => 'test-product-images',
        'title' => 'Test Product with Images Updated',
        'images' => [
            'http://localhost:8000/storage/products/image2.jpg',
        ],
    ])->assertOk();

    expect($product->fresh()->files()->count())->toBe(1);
    expect($product->fresh()->files()->first()->url)->toBe('http://localhost:8000/storage/products/image2.jpg');
});
