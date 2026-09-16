<?php

declare(strict_types=1);

use App\Modules\Orders\Models\Order;

it('throttles repeated login/check calls for the same e-mail (VULN-04)', function (): void {
    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/login/check', ['email' => 'probe@example.com'])->assertOk();
    }

    $this->postJson('/login/check', ['email' => 'probe@example.com'])->assertStatus(429);
});

it('throttles repeated password-reset requests for the same e-mail (VULN-04)', function (): void {
    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/forgot-password', ['email' => 'probe@example.com']);
    }

    $this->postJson('/forgot-password', ['email' => 'probe@example.com'])->assertStatus(429);
});

it('throttles repeated password-update (reset confirmation) attempts for the same e-mail (VULN-04)', function (): void {
    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/reset-password', ['email' => 'probe@example.com', 'token' => 'invalid', 'password' => 'x', 'password_confirmation' => 'x']);
    }

    $this->postJson('/reset-password', ['email' => 'probe@example.com', 'token' => 'invalid', 'password' => 'x', 'password_confirmation' => 'x'])
        ->assertStatus(429);
});

it('throttles repeated public order-reference lookups from the same IP (VULN-04)', function (): void {
    $order = Order::factory()->paid()->create();

    for ($i = 0; $i < 20; $i++) {
        $this->getJson('/v1/orders/'.$order->reference);
    }

    $this->getJson('/v1/orders/'.$order->reference)->assertStatus(429);
});
