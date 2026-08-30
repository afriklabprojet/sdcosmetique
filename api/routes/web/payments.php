<?php

declare(strict_types=1);

use App\Modules\Payments\Http\Controllers\Webhooks\CinetPayNotificationController;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Support\Facades\Route;

Route::post('webhooks/cinetpay', [CinetPayNotificationController::class, 'store'])
    ->name('webhooks.cinetpay')
    ->withoutMiddleware(ValidateCsrfToken::class);
