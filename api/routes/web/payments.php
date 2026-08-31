<?php

declare(strict_types=1);

use App\Modules\Loyalty\Http\Controllers\Webhooks\JekoPayNotificationController;
use App\Modules\Payments\Http\Controllers\Webhooks\NotificationController;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Support\Facades\Route;

Route::post('webhooks/jeko-pay', [JekoPayNotificationController::class, 'store'])
    ->name('webhooks.jeko-pay')
    ->withoutMiddleware(ValidateCsrfToken::class);

Route::post('webhooks/{terminal}', [NotificationController::class, 'store'])
    ->name('webhooks.terminal')
    ->withoutMiddleware(ValidateCsrfToken::class);
