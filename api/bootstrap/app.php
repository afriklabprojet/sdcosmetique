<?php

declare(strict_types=1);

use App\Shared\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web/index.php',
        api: __DIR__.'/../routes/api/index.php',
        apiPrefix: 'v1',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->encryptCookies(except: ['guest_token']);
        $middleware->validateCsrfTokens(except: ['webhooks/*']);
        $middleware->redirectGuestsTo(fn (): string => config('app.frontend_url').'/login');
        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
        ]);
        // Déploiement derrière le reverse proxy de l'hébergeur (Hostinger) —
        // sans ça, `$request->ip()` renvoie l'IP du proxy pour TOUT le monde
        // (un seul "utilisateur" pour le rate limiting) et `$request->secure()`
        // peut se tromper sur le schéma réel. `'*'` fait confiance à
        // n'importe quel proxy immédiat : acceptable seulement parce que le
        // serveur d'origine n'est pas censé être joignable en direct depuis
        // l'extérieur — si un CDN/proxy supplémentaire (ex. Cloudflare)
        // s'ajoute un jour devant, restreindre à ses plages IP publiées.
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request): bool => $request->is('v1/*') || $request->expectsJson(),
        );
    })->create();
