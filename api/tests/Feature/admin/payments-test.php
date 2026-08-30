<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment;
use App\Modules\Payments\Models\Payment\Notification;

it('guards payment endpoints', function (): void {
    $this->getJson('/api/admin/payments')->assertUnauthorized();
    $this->getJson('/api/admin/payment-notifications')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/api/admin/payments')->assertForbidden();
    $this->getJson('/api/admin/payment-notifications')->assertForbidden();
});

it('lists and shows payments', function (): void {
    $order = Order::factory()->placed()->create();
    $payment = Payment::factory()->create(['order_id' => $order->id]);

    $this->actingAs(admin());

    $this->getJson('/api/admin/payments')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonStructure(['data' => [['id', 'order_reference', 'amount', 'status']]]);

    $this->getJson('/api/admin/payments/'.$payment->id)
        ->assertOk()
        ->assertJsonPath('data.id', $payment->id);
});

it('lists and shows payment notifications with payload on show', function (): void {
    $notification = Notification::factory()->create();

    $this->actingAs(admin());

    $this->getJson('/api/admin/payment-notifications')
        ->assertOk()
        ->assertJsonCount(1, 'data');

    $this->getJson('/api/admin/payment-notifications/'.$notification->id)
        ->assertOk()
        ->assertJsonPath('data.id', $notification->id)
        ->assertJsonPath('data.payload.raw', true);
});
