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
