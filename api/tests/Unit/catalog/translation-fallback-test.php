<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;

it('falls back to the base column when a locale row is missing', function (): void {
    $product = Product::factory()->create(['title' => 'Hydraglow Daily Gel Cleanser']);

    app()->setLocale('fr');

    expect($product->title)->toBe('Hydraglow Daily Gel Cleanser');
});

it('returns the translated value when a locale row exists', function (): void {
    $product = Product::factory()->create(['title' => 'Hydraglow Daily Gel Cleanser']);

    $product->translations()->create([
        'locale' => 'fr',
        'field' => 'title',
        'value' => 'Gel nettoyant Hydraglow',
    ]);

    $product->unsetRelation('translations');
    app()->setLocale('fr');

    expect($product->fresh()->title)->toBe('Gel nettoyant Hydraglow');
});
