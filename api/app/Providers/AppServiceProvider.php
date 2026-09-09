<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

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

        // Par e-mail ET par IP (§9) : un limiteur seul laisserait passer soit
        // un attaquant qui change d'e-mail à chaque essai, soit un qui change
        // d'IP — les deux clés doivent être respectées simultanément.
        RateLimiter::for('otp-request', function (Request $request): array {
            $email = Str::lower(trim((string) $request->input('email', '')));

            return [
                Limit::perMinute(20)->by('otp-request-ip:'.($request->ip() ?? 'unknown')),
                Limit::perMinutes(10, 3)->by('otp-request-email:'.$email),
            ];
        });

        RateLimiter::for('otp-verify', function (Request $request): array {
            $email = Str::lower(trim((string) $request->input('email', '')));

            return [
                Limit::perMinute(20)->by('otp-verify-ip:'.($request->ip() ?? 'unknown')),
                Limit::perMinutes(10, 8)->by('otp-verify-email:'.$email),
            ];
        });
    }
}
