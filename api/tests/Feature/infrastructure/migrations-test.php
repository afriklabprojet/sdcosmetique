<?php

declare(strict_types=1);

it('creates each domain table in exactly one migration', function (): void {
    $creates = [];

    foreach (glob(database_path('migrations/*.php')) as $file) {
        $contents = file_get_contents($file) ?: '';
        if (preg_match_all("/Schema::create\\('([^']+)'/", $contents, $matches) === 0) {
            continue;
        }

        foreach ($matches[1] as $table) {
            $creates[$table][] = basename($file);
        }
    }

    foreach ($creates as $table => $files) {
        expect($files)->toHaveCount(1, "{$table} is created in more than one migration");
    }
});

it('keeps the circular-pointer migration last among the 2026 domain files', function (): void {
    $domain = collect(glob(database_path('migrations/2026_01_01_*.php')))
        ->map(fn (string $path): string => basename($path))
        ->sort()
        ->values();

    expect($domain->last())->toBe('2026_01_01_000032_add_circular_foreign_keys.php')
        ->and($domain)->toHaveCount(30);
});

it('emits domain schema only through the schema builder', function (): void {
    foreach (glob(database_path('migrations/2026_*.php')) as $file) {
        $contents = file_get_contents($file) ?: '';

        expect($contents)
            ->not->toContain('DB::statement')
            ->not->toContain('DB::unprepared')
            ->not->toContain('ENGINE=')
            ->not->toContain('ON UPDATE CURRENT_TIMESTAMP');
    }
});
