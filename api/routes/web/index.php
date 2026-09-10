<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

require __DIR__.'/login.php';

Route::middleware('throttle:webhooks')->group(function (): void {
    require __DIR__.'/payments.php';
});

Route::middleware('signed')->group(function (): void {
    require __DIR__.'/marketing.php';
});
