<?php

declare(strict_types=1);

namespace App\Modules\Identity\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $admin = $user->admin;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'admin' => [
                'role' => $admin->role,
                'root' => $admin->root(),
            ],
        ]);
    }
}
