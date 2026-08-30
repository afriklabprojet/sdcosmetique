<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;

it('takes and restores stock on a sellable child', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create(['stock' => 5]);

    $child->take(2);

    expect($child->fresh()->stock)->toBe(3);

    $child->restore(2);

    expect($child->fresh()->stock)->toBe(5);
});

it('falls back to parent stock when the child is empty', function (): void {
    $parent = Product::factory()->parentProduct()->create(['stock' => 4]);
    $child = Product::factory()->child($parent)->create(['stock' => 0]);

    expect($child->inventory()->effective())->toBe(4)
        ->and($child->inventory()->available())->toBeTrue();

    $child->take(1);

    expect($parent->fresh()->stock)->toBe(3);
});

it('refuses to take more than the effective stock', function (): void {
    $child = Product::factory()->child()->create(['stock' => 1]);

    $child->take(2);
})->throws(DomainException::class, 'Insufficient stock.');

it('does not fall back to parent stock when the child still has units', function (): void {
    $parent = Product::factory()->parentProduct()->create(['stock' => 10]);
    $child = Product::factory()->child($parent)->create(['stock' => 2]);

    expect($child->inventory()->effective())->toBe(2);

    expect(fn () => $child->take(5))->toThrow(DomainException::class, 'Insufficient stock.');

    expect($child->fresh()->stock)->toBe(2)
        ->and($parent->fresh()->stock)->toBe(10);
});

it('refuses a second take when stock is already exhausted', function (): void {
    $child = Product::factory()->child()->create(['stock' => 1]);

    $child->take(1);

    expect(fn () => $child->fresh()->take(1))->toThrow(DomainException::class, 'Insufficient stock.')
        ->and($child->fresh()->stock)->toBe(0);
});

it('treats a parent with children as not sellable', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    Product::factory()->child($parent)->create();

    expect($parent->fresh()->sellable())->toBeFalse()
        ->and($parent->children)->toHaveCount(1);
});
