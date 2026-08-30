<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Providers;

use App\Models\User;
use App\Modules\Shopping\Domain\Session;
use App\Modules\Shopping\Models\Cart;
use App\Modules\Shopping\Models\Coupon;
use App\Modules\Shopping\Policies\CartPolicy;
use App\Modules\Shopping\Policies\CouponPolicy;
use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Event;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'shopping';
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [
            Cart::class => CartPolicy::class,
            Coupon::class => CouponPolicy::class,
        ];
    }

    public function boot(): void
    {
        parent::boot();

        Event::listen(Login::class, function (Login $event): void {
            $user = $event->user;

            if (! $user instanceof User) {
                return;
            }

            $client = $user->client ?? $user->client()->create([]);
            $token = Session::token(request());

            if ($token === null) {
                return;
            }

            $guest = Cart::query()->where('guest_token', $token)->first();
            $cart = Cart::current($client, null);

            if ($guest !== null) {
                $cart->merge($guest);
            }

            Cookie::queue(Cookie::forget('guest_token'));
        });
    }
}
