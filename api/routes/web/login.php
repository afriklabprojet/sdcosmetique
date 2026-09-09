<?php

declare(strict_types=1);

use App\Modules\Identity\Http\Controllers\Auth\LoginCheckController;
use App\Modules\Identity\Http\Controllers\Auth\OtpLoginController;
use Illuminate\Support\Facades\Route;

/*
 * Connexion en deux étapes (§5-8) : ces routes vivent au même niveau que
 * celles de Fortify (/login, /forgot-password — sans préfixe /v1) puisque
 * ce sont, comme elles, des points d'entrée d'authentification et non des
 * ressources de l'API applicative.
 */
Route::post('login/check', LoginCheckController::class)->name('login.check');

Route::middleware('throttle:otp-request')
    ->post('login/otp', [OtpLoginController::class, 'request'])
    ->name('login.otp.request');

Route::middleware('throttle:otp-verify')
    ->post('login/otp/verify', [OtpLoginController::class, 'verify'])
    ->name('login.otp.verify');
