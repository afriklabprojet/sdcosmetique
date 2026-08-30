<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Orders\Models\Order;

it('guards the metrics endpoint', function (): void {
    $this->getJson('/api/admin/metrics/overview')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/api/admin/metrics/overview')->assertForbidden();
});

it('returns the metrics overview shape', function (): void {
    Order::factory()->paid()->create();

    $this->actingAs(admin());

    $this->getJson('/api/admin/metrics/overview')
        ->assertOk()
        ->assertJsonStructure([
            'revenue' => ['today', 'last_7_days', 'last_30_days', 'currency'],
            'orders_per_day' => [['date', 'count']],
            'low_stock',
            'pending_payments',
            'unhandled_notifications',
        ]);
});
