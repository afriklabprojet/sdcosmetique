<?php

declare(strict_types=1);

it('lists every on-disk module provider in config and every configured provider exists', function (): void {
    $configured = config('modules.enabled');
    $onDisk = collect(glob(app_path('Modules/*/Providers/ModuleServiceProvider.php')))
        ->map(function (string $path): string {
            $module = basename(dirname($path, 2));

            return "App\\Modules\\{$module}\\Providers\\ModuleServiceProvider";
        })
        ->sort()
        ->values()
        ->all();

    expect($configured)->toHaveCount(8)
        ->and(collect($configured)->sort()->values()->all())->toBe($onDisk);
});

it('does not load routes, migrations or factories from a module provider', function (): void {
    $sources = collect(glob(app_path('Modules/*/Providers/ModuleServiceProvider.php')))
        ->map(fn (string $path): string => file_get_contents($path) ?: '');

    foreach ($sources as $source) {
        expect($source)
            ->not->toContain('loadRoutesFrom')
            ->not->toContain('loadMigrationsFrom')
            ->not->toContain('loadFactoriesFrom');
    }
});
