<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

Route::middleware('throttle:webhooks')->group(function (): void {
    require __DIR__.'/payments.php';
});
