<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use App\Modules\Settings\Models\Setting;
use Illuminate\Support\Facades\Http;

it('does not call the storefront when the revalidate secret is empty', function (): void {
    config(['services.web.revalidate_secret' => '']);
    Http::fake();

    Product::factory()->create();
    Setting::factory()->create(['key' => 'hero_revalidate_'.uniqid()]);

    Http::assertNothingSent();
});

it('posts storefront tags after a product write when the secret is set', function (): void {
    config([
        'services.web.url' => 'http://web.test',
        'services.web.revalidate_secret' => 'testing-revalidate-secret',
    ]);
    Http::fake();

    Product::factory()->create();

    Http::assertSent(function ($request): bool {
        return $request->url() === 'http://web.test/api/revalidate'
            && $request['tags'] === ['products']
            && $request->header('x-revalidate-secret') === ['testing-revalidate-secret'];
    });
});
