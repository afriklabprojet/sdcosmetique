<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Reviews\Models\Review;

it('lists approved reviews and accepts a public store', function (): void {
    $product = Product::factory()->create();
    Review::factory()->create(['product_id' => $product->id, 'author_name' => 'Awa']);
    Review::factory()->pending()->create(['product_id' => $product->id]);

    $this->getJson('/api/reviews?product='.$product->slug)
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.author', 'Awa')
        ->assertJsonPath('data.0.product_slug', $product->slug);

    $this->postJson('/api/reviews', [
        'product' => $product->slug,
        'author' => 'Fatou',
        'rating' => 5,
        'comment' => 'Glow after one week.',
    ])->assertCreated()
        ->assertJsonPath('data.author', 'Fatou');

    expect(Review::query()->whereNull('approved_at')->count())->toBe(2);
});

it('validates review payloads', function (): void {
    $this->postJson('/api/reviews', ['author' => 'Awa'])->assertUnprocessable();
});

it('guards admin reviews', function (): void {
    $this->getJson('/api/admin/reviews')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/api/admin/reviews')->assertForbidden();
});

it('lets an admin approve and delete a review', function (): void {
    $review = Review::factory()->pending()->create();

    $this->actingAs(admin());

    $this->patchJson('/api/admin/reviews/'.$review->id, [
        'approved' => true,
        'verified' => true,
    ])->assertOk()
        ->assertJsonPath('data.approved', true)
        ->assertJsonPath('data.verified', true);

    $this->deleteJson('/api/admin/reviews/'.$review->id)->assertNoContent();

    expect(Review::query()->count())->toBe(0);
});
