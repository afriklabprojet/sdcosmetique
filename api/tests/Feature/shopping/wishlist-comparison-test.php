<?php

declare(strict_types=1);

use App\Modules\Accounts\Models\Client;
use App\Modules\Catalog\Models\Product;
use App\Modules\Shopping\Models\Comparison\Item as ComparisonItem;
use App\Modules\Shopping\Models\Wishlist\Item as WishlistItem;

it('requires an authenticated client for wishlist and comparison', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    Product::factory()->child($parent)->create();

    $this->postJson('/api/wishlist-items', ['product' => $parent->slug])->assertUnauthorized();
    $this->postJson('/api/comparison-items', ['product' => $parent->slug])->assertUnauthorized();
    $this->getJson('/api/account/wishlist')->assertUnauthorized();
    $this->getJson('/api/comparison')->assertUnauthorized();
    $this->deleteJson('/api/comparison')->assertUnauthorized();
});

it('stores wishlist and comparison items for a client and caps comparison at four', function (): void {
    $client = Client::factory()->create();
    $this->actingAs($client->user);

    $slugs = [];
    foreach (range(1, 5) as $index) {
        $parent = Product::factory()->parentProduct()->create(['title' => 'Item '.$index]);
        Product::factory()->child($parent)->create();
        $slugs[] = $parent->slug;
    }

    $this->postJson('/api/wishlist-items', ['product' => $slugs[0]])->assertCreated();
    $this->getJson('/api/account/wishlist')->assertOk()->assertJsonCount(1, 'data');

    foreach (array_slice($slugs, 0, 4) as $slug) {
        $this->postJson('/api/comparison-items', ['product' => $slug])->assertSuccessful();
    }

    $this->postJson('/api/comparison-items', ['product' => $slugs[4]])
        ->assertUnprocessable();

    $this->getJson('/api/comparison')->assertOk()->assertJsonCount(4, 'data');

    $this->deleteJson('/api/comparison')->assertNoContent();
    expect(ComparisonItem::query()->where('client_id', $client->id)->count())->toBe(0);
});

it('scopes wishlist and comparison rows to the authenticated client', function (): void {
    $owner = Client::factory()->create();
    $stranger = Client::factory()->create();
    $parent = Product::factory()->parentProduct()->create();
    Product::factory()->child($parent)->create();

    $wishlist = WishlistItem::factory()->create([
        'client_id' => $owner->id,
        'product_id' => $parent->id,
    ]);
    $comparison = ComparisonItem::factory()->create([
        'client_id' => $owner->id,
        'product_id' => $parent->id,
    ]);

    $this->actingAs($stranger->user);

    $this->deleteJson('/api/wishlist-items/'.$wishlist->id)->assertNotFound();
    $this->deleteJson('/api/comparison-items/'.$comparison->id)->assertNotFound();

    expect(WishlistItem::query()->whereKey($wishlist->id)->exists())->toBeTrue()
        ->and(ComparisonItem::query()->whereKey($comparison->id)->exists())->toBeTrue();
});
