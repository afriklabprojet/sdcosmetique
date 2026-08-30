<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        RateLimiter::for('leads', function (Request $request): Limit {
            return Limit::perMinute(10)->by($request->ip() ?? 'leads');
        });

        RateLimiter::for('payments', function (Request $request): Limit {
            return Limit::perMinute(10)->by($request->ip() ?? 'payments');
        });

        RateLimiter::for('webhooks', function (Request $request): Limit {
            return Limit::perMinute(60)->by($request->ip() ?? 'webhooks');
        });
    }
}
