<?php

declare(strict_types=1);

use App\Jobs\SendOrderInvoiceEmailJob;
use App\Mail\OrderConfirmationMail;
use App\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Invoicing\Domain\InvoicePdfBuilder;
use App\Modules\Invoicing\Models\Invoice;
use App\Modules\Orders\Models\Delivery\Method;
use App\Modules\Orders\Models\Order;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

it('guards invoice endpoints', function (): void {
    $order = Order::factory()->paid()->create();

    $this->getJson('/v1/admin/orders/'.$order->id.'/invoice')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/v1/admin/orders/'.$order->id.'/invoice')->assertForbidden();
});

it('streams a PDF for "voir le reçu" and assigns a number on first view', function (): void {
    $order = Order::factory()->paid()->create();
    $this->actingAs(admin());

    $response = $this->get('/v1/admin/orders/'.$order->id.'/invoice');

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf')
        ->and(Invoice::query()->where('order_id', $order->id)->exists())->toBeTrue();
});

it('downloads the PDF as an attachment', function (): void {
    $order = Order::factory()->paid()->create();
    $this->actingAs(admin());

    $response = $this->get('/v1/admin/orders/'.$order->id.'/invoice/download');

    $response->assertOk();
    expect($response->headers->get('content-disposition'))->toContain('attachment');
});

it('previews an invoice from the most recently placed real order, for the settings page', function (): void {
    $older = Order::factory()->placed()->create(['placed_at' => now()->subDays(2)]);
    $newer = Order::factory()->placed()->create(['placed_at' => now()->subHour()]);
    $this->actingAs(admin());

    $response = $this->get('/v1/admin/invoice-preview');

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf')
        ->and(Invoice::query()->where('order_id', $newer->id)->exists())->toBeTrue()
        ->and(Invoice::query()->where('order_id', $older->id)->exists())->toBeFalse();
});

it('returns a clear 404 when previewing with no order in the database at all', function (): void {
    $this->actingAs(admin());

    $this->get('/v1/admin/invoice-preview')->assertNotFound();
});

it('reports the invoice number and email status without rendering or sending anything', function (): void {
    Bus::fake();
    $order = Order::factory()->paid()->create();
    $this->actingAs(admin());

    $response = $this->getJson('/v1/admin/orders/'.$order->id.'/invoice/status')->assertOk();

    expect($response->json('data.number'))->toStartWith('SDC-'.now()->year.'-')
        ->and($response->json('data.email_status'))->toBe('not_sent')
        ->and($response->json('data.email_sent_at'))->toBeNull();

    Bus::assertNotDispatched(SendOrderInvoiceEmailJob::class);
});

it('dispatches the confirmation email job and marks it pending when an admin sends the invoice', function (): void {
    Bus::fake();
    $order = Order::factory()->paid()->create();
    $this->actingAs(admin());

    $this->postJson('/v1/admin/orders/'.$order->id.'/invoice/send')
        ->assertOk()
        ->assertJsonPath('data.email_status', 'pending');

    Bus::assertDispatched(SendOrderInvoiceEmailJob::class, fn (SendOrderInvoiceEmailJob $job): bool => $job->orderId === $order->id);
    expect(Invoice::query()->where('order_id', $order->id)->value('email_status'))->toBe('pending');
});

it('sends the confirmation email with the generated invoice PDF attached', function (): void {
    Mail::fake();
    $order = Order::factory()->paid()->create(['email' => 'facture@example.com']);

    (new SendOrderInvoiceEmailJob($order->id))->handle(app(InvoicePdfBuilder::class));

    Mail::assertSent(OrderConfirmationMail::class, function (OrderConfirmationMail $mail) use ($order): bool {
        $attachment = $mail->attachments()[0] ?? null;

        if ($attachment === null) {
            return false;
        }

        $pdfContent = $attachment->attachWith(
            fn (): null => null,
            fn (callable $data): string => $data(),
        );

        return $mail->hasTo('facture@example.com')
            && $mail->order->is($order)
            && $attachment->as === 'Facture-SD-COSMETIQUE-'.$mail->invoiceNumber.'.pdf'
            && $attachment->mime === 'application/pdf'
            && str_starts_with($pdfContent, '%PDF-');
    });

    expect(Invoice::query()->where('order_id', $order->id)->value('email_status'))->toBe(Invoice::STATUS_SENT);
});

it('dispatches exactly one confirmation email job when a payment settles, never a duplicate', function (): void {
    Bus::fake();
    Http::fake([
        'https://api.jeko.africa/*' => Http::response([
            'id' => 'jeko-request-invoice-123',
            'redirectUrl' => 'https://pay.jeko.africa/abc',
        ], 200),
    ]);

    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create(['regular_price' => 100, 'sale_price' => null, 'stock' => 3]);
    $method = Method::factory()->create(['amount' => 0, 'cost' => 0]);

    $this->postJson('/v1/cart-items', ['product' => $child->slug, 'quantity' => 1])->assertCreated();
    $this->putJson('/v1/checkout/contact', ['email' => 'invoice-test@example.com'])->assertOk();
    $this->putJson('/v1/checkout/delivery', [
        'delivery_method_id' => $method->id,
        'first_name' => 'Awa', 'last_name' => 'Kouassi',
        'line_1' => 'Cocody', 'city' => 'Abidjan', 'country' => 'CI',
    ])->assertOk();
    $this->putJson('/v1/checkout/payment', ['gateway' => 'jeko'])->assertOk();
    $placed = $this->postJson('/v1/orders')->assertCreated();
    $reference = $placed->json('data.reference');

    $payment = $this->postJson('/v1/orders/'.$reference.'/payments', ['payment_method' => 'wave', 'email' => 'invoice-test@example.com'])->assertCreated();
    $attemptReference = $payment->json('data.reference');

    $payload = json_encode(['reference' => $attemptReference, 'status' => 'PAID'], JSON_THROW_ON_ERROR);
    $signature = hash_hmac('sha256', $payload, 'testing-jeko-secret');

    // Le webhook peut être rejoué (le PSP retente) — un seul job doit partir.
    for ($i = 0; $i < 2; $i++) {
        $this->call('POST', '/webhooks/jeko-pay', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_JEKO_SIGNATURE' => $signature,
        ], $payload)->assertOk();
    }

    Bus::assertDispatchedTimes(SendOrderInvoiceEmailJob::class, 1);
});
