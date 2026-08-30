<?php

declare(strict_types=1);

use App\Modules\Orders\Http\Controllers\Checkout\ContactController;
use App\Modules\Orders\Http\Controllers\Checkout\DeliveryController;
use App\Modules\Orders\Http\Controllers\Checkout\PaymentMethodController;
use App\Modules\Orders\Http\Controllers\Checkout\ReviewController;
use App\Modules\Orders\Http\Controllers\CheckoutController;
use App\Modules\Orders\Http\Controllers\DeliveryMethodController;
use App\Modules\Orders\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::get('checkout', CheckoutController::class)->name('checkout');
Route::singleton('checkout/contact', ContactController::class)->only(['show', 'update']);
Route::singleton('checkout/delivery', DeliveryController::class)->only(['show', 'update']);
Route::singleton('checkout/payment', PaymentMethodController::class)->only(['show', 'update']);
Route::singleton('checkout/review', ReviewController::class)->only(['show']);
Route::get('delivery-methods', DeliveryMethodController::class)->name('delivery-methods.index');
Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
Route::get('orders/{order:reference}', [OrderController::class, 'show'])
    ->where('order', '[A-Za-z0-9-]+')
    ->name('orders.show');
