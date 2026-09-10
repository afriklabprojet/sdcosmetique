<?php

declare(strict_types=1);

use App\Modules\Messaging\Http\Controllers\UnsubscribeController;
use Illuminate\Support\Facades\Route;

Route::get('marketing/unsubscribe/{client}', [UnsubscribeController::class, 'show'])
    ->name('marketing.unsubscribe');
