<?php

declare(strict_types=1);

it('never adds middleware on a route leaf', function (): void {
    $leaves = array_merge(
        glob(base_path('routes/api/*.php')) ?: [],
        glob(base_path('routes/web/*.php')) ?: [],
    );

    foreach ($leaves as $leaf) {
        if (basename($leaf) === 'index.php') {
            continue;
        }

        $contents = file_get_contents($leaf) ?: '';

        expect($contents)->not->toMatch('/->middleware\s*\(/');
    }
});

it('allows withoutMiddleware only on webhook routes', function (): void {
    $leaves = glob(base_path('routes/web/*.php')) ?: [];

    foreach ($leaves as $leaf) {
        $contents = file_get_contents($leaf) ?: '';
        if (! str_contains($contents, 'withoutMiddleware')) {
            continue;
        }

        expect($contents)->toContain("name('webhooks.");
    }
});

it('applies throttle middleware to public mutation endpoints', function (): void {
    $router = app('router');

    foreach (['orders.payments.store', 'webhooks.cinetpay', 'newsletter-subscriptions.store', 'contact-messages.store', 'reviews.store'] as $name) {
        $route = $router->getRoutes()->getByName($name);
        expect($route)->not->toBeNull();

        $middleware = collect($route->gatherMiddleware())
            ->map(fn (mixed $entry): string => (string) $entry)
            ->implode(' ');

        expect($middleware)->toContain('throttle:');
    }
});
