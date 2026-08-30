<?php

declare(strict_types=1);

use App\Modules\Accounts\Http\Controllers\AccountController;
use App\Modules\Accounts\Http\Controllers\AddressController;
use App\Modules\Accounts\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::get('account', [AccountController::class, 'show'])->name('account.show');
Route::put('account', [AccountController::class, 'update'])->name('account.update');
Route::apiResource('account/addresses', AddressController::class);
Route::get('account/orders', [OrderController::class, 'index'])->name('account.orders.index');
Route::get('account/orders/{order:reference}', [OrderController::class, 'show'])
    ->where('order', '[A-Za-z0-9-]+')
    ->name('account.orders.show');
