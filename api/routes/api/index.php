<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

require __DIR__.'/ping.php';
require __DIR__.'/catalog.php';
require __DIR__.'/content.php';
require __DIR__.'/shopping.php';
require __DIR__.'/orders.php';
require __DIR__.'/session.php';

Route::middleware('throttle:leads')->group(function (): void {
    require __DIR__.'/leads.php';
});

Route::middleware('throttle:payments')->group(function (): void {
    require __DIR__.'/payments.php';
});

Route::middleware('auth:sanctum')->group(function (): void {
    require __DIR__.'/shopping-account.php';
    require __DIR__.'/accounts.php';
});

Route::middleware(['auth:sanctum', 'admin'])->group(function (): void {
    require __DIR__.'/admin.php';
});
