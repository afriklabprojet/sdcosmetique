<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Domain;

use App\Modules\Accounts\Models\Client;
use App\Modules\Shopping\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class Session
{
    public static function token(Request $request): ?string
    {
        $token = $request->cookie('guest_token');

        return is_string($token) && $token !== '' ? $token : null;
    }

    public static function cart(Request $request, bool $mint = false): Cart
    {
        $client = $request->user()?->client;

        if ($client instanceof Client) {
            return Cart::current($client, null);
        }

        $token = self::token($request);

        if ($token === null) {
            if (! $mint) {
                abort(422, 'The cart is empty.');
            }

            $minted = $request->attributes->get('cart.guest_token');
            $token = is_string($minted) && $minted !== '' ? $minted : (string) Str::uuid();
            $request->attributes->set('cart.guest_token', $token);
        }

        return Cart::current(null, $token);
    }
}
