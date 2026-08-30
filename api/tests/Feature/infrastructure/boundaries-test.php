<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Factories\Factory;

it('has no Services directories and no module Actions classes', function (): void {
    expect(glob(app_path('Modules/*/Services')) ?: [])->toBeEmpty()
        ->and(glob(app_path('Modules/*/Actions/*.php')) ?: [])->toBeEmpty();
});

it('resolves a factory for every Eloquent model', function (): void {
    $paths = array_merge(
        glob(app_path('Models/*.php')) ?: [],
        glob(app_path('Modules/*/Models/*.php')) ?: [],
        glob(app_path('Modules/*/Models/*/*.php')) ?: [],
        [app_path('Shared/Translations/Translation.php')],
    );

    foreach ($paths as $path) {
        $relative = str_replace(app_path().'/', 'App/', $path);
        $class = str_replace(['/', '.php'], ['\\', ''], $relative);
        expect(class_exists($class))->toBeTrue();

        if (! is_subclass_of($class, \Illuminate\Database\Eloquent\Model::class)) {
            continue;
        }

        expect($class::factory())->toBeInstanceOf(Factory::class);
    }
});

it('keeps test files kebab-case and suffixed -test.php', function (): void {
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(base_path('tests'), FilesystemIterator::SKIP_DOTS),
    );

    foreach ($iterator as $file) {
        if (! $file->isFile() || $file->getExtension() !== 'php') {
            continue;
        }

        $name = $file->getFilename();
        if (in_array($name, ['Pest.php', 'TestCase.php'], true)) {
            continue;
        }

        expect($name)->toEndWith('-test.php');
    }
});

it('keeps Orders from importing Payments types', function (): void {
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(app_path('Modules/Orders')),
    );

    foreach ($files as $file) {
        if (! $file->isFile() || $file->getExtension() !== 'php') {
            continue;
        }

        $contents = file_get_contents($file->getPathname()) ?: '';
        expect($contents)->not->toContain('App\\Modules\\Payments');
    }
});

it('keeps Catalog and Content as independent roots', function (): void {
    $pairs = [
        ['Catalog', 'Content'],
        ['Content', 'Catalog'],
    ];

    foreach ($pairs as [$from, $forbidden]) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator(app_path('Modules/'.$from)),
        );

        foreach ($files as $file) {
            if (! $file->isFile() || $file->getExtension() !== 'php') {
                continue;
            }

            $contents = file_get_contents($file->getPathname()) ?: '';
            expect($contents)->not->toContain('App\\Modules\\'.$forbidden);
        }
    }
});
