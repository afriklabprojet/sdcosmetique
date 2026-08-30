<?php

declare(strict_types=1);

use App\Modules\Shopping\Http\Controllers\CartController;
use App\Modules\Shopping\Http\Controllers\CartCouponController;
use App\Modules\Shopping\Http\Controllers\CartItemController;
use Illuminate\Support\Facades\Route;

Route::get('cart', [CartController::class, 'show'])->name('cart.show');
Route::apiResource('cart-items', CartItemController::class)->only(['store', 'update', 'destroy']);
Route::apiResource('cart-coupon', CartCouponController::class)->only(['store', 'destroy']);
