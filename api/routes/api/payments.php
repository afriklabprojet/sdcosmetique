<?php

declare(strict_types=1);

use App\Modules\Payments\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::post('orders/{order:reference}/payments', [PaymentController::class, 'store'])
    ->where('order', '[A-Za-z0-9-]+')
    ->name('orders.payments.store');
