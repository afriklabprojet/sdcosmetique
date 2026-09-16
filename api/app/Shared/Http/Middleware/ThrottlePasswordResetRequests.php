<?php

declare(strict_types=1);

namespace App\Shared\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;

final class ThrottlePasswordResetRequests
{
    public function handle(Request $request, Closure $next): mixed
    {
        if (! $request->routeIs('password.email', 'password.update')) {
            return $next($request);
        }

        return app(ThrottleRequests::class)->handle($request, $next, 'password-reset');
    }
}
