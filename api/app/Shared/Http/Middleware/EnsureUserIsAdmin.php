<?php

declare(strict_types=1);

namespace App\Shared\Http\Middleware;

use App\Modules\Identity\Enums\AdminRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->administrator()) {
            abort(403);
        }

        $admin = $request->user()->admin;

        if ($admin->tier() === AdminRole::Cashier
            && ! $request->is('v1/admin/session')
            && ! $request->is('v1/admin/pos/*')) {
            abort(403);
        }

        return $next($request);
    }
}
