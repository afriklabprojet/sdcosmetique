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

        // `login/check` révèle volontairement si un e-mail est inscrit
        // (§LoginCheckController) — sans limite, il permet un scan massif de
        // comptes existants (VULN-04).
        RateLimiter::for('login-check', function (Request $request): array {
            $email = Str::lower(trim((string) $request->input('email', '')));

            return [
                Limit::perMinute(20)->by('login-check-ip:'.($request->ip() ?? 'unknown')),
                Limit::perMinutes(10, 5)->by('login-check-email:'.$email),
            ];
        });

        // Réinitialisation de mot de passe (Fortify) — sans limite, permet
        // le spam d'e-mails de reset et l'essai en boucle du code (VULN-04).
        RateLimiter::for('password-reset', function (Request $request): array {
            $email = Str::lower(trim((string) $request->input('email', '')));

            return [
                Limit::perMinute(20)->by('password-reset-ip:'.($request->ip() ?? 'unknown')),
                Limit::perMinutes(10, 5)->by('password-reset-email:'.$email),
            ];
        });

        // Consultation publique d'une commande invité — la référence est
        // désormais courte et séquentielle (§OrderPolicy), seul l'e-mail sert
        // de second facteur ; sans limite, elle reste énumérable (VULN-04).
        RateLimiter::for('order-lookup', function (Request $request): Limit {
            return Limit::perMinute(20)->by($request->ip() ?? 'order-lookup');
        });
    }
}
