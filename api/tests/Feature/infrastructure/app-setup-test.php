<?php

declare(strict_types=1);

use App\Modules\Settings\Models\Setting;
use Illuminate\Support\Facades\Artisan;

it('runs app:setup command without seeding', function (): void {
    $exitCode = Artisan::call('app:setup');

    expect($exitCode)->toBe(0);
});

it('runs app:setup command with full production seeding', function (): void {
    $exitCode = Artisan::call('app:setup', ['--seed' => true]);

    expect($exitCode)->toBe(0);
    expect(Setting::query()->where('key', 'branding')->exists())->toBeTrue();
});

it('does not seed products during app:setup in production environment', function (): void {
    $this->app['env'] = 'production';

    $exitCode = Artisan::call('app:setup', ['--seed' => true]);

    expect($exitCode)->toBe(0)
        ->and(\App\Modules\Catalog\Models\Product::count())->toBe(0)
        ->and(\App\Modules\Catalog\Models\Category::count())->toBe(13)
        ->and(\App\Modules\Catalog\Models\Tone::count())->toBe(5)
        ->and(Setting::query()->where('key', 'branding')->exists())->toBeTrue();
});
