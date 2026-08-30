<?php

declare(strict_types=1);

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('session', static fn (Request $request): JsonResponse => response()->json([
    'user' => $request->user(),
]))->name('session.show');
