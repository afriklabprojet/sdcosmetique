<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Accounts\Models\Client;
use App\Modules\Shopping\Domain\Session;
use App\Modules\Shopping\Models\Cart;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

it('extracts guest token from cookie via Session domain noun', function (): void {
    $request = Request::create('/', 'GET', [], ['guest_token' => 'custom-guest-token']);

    expect(Session::token($request))->toBe('custom-guest-token');
});

it('resolves authenticated client cart via Session domain noun', function (): void {
    $user = User::factory()->create();
    $client = Client::factory()->create(['user_id' => $user->id]);

    $request = Request::create('/', 'GET');
    $request->setUserResolver(fn (): User => $user);

    $cart = Session::cart($request);

    expect($cart->client_id)->toBe($client->id);
});

it('mints a guest token and cart when requested via Session domain noun', function (): void {
    $request = Request::create('/', 'GET');

    $cart = Session::cart($request, mint: true);

    expect($cart->guest_token)->not->toBeNull()
        ->and($request->attributes->get('cart.guest_token'))->toBe($cart->guest_token);
});

it('aborts 422 when cart is empty and minting is disabled', function (): void {
    $request = Request::create('/', 'GET');

    Session::cart($request, mint: false);
})->throws(HttpException::class, 'The cart is empty.');
