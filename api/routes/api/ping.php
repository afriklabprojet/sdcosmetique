<?php

declare(strict_types=1);

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

Route::get('ping', static fn (): JsonResponse => response()->json(['pong' => true]))->name('ping');
