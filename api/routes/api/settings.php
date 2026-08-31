<?php

declare(strict_types=1);

use App\Modules\Settings\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;

Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
Route::get('settings/{setting}', [SettingController::class, 'show'])
    ->where('setting', '[a-z0-9_]+')
    ->name('settings.show');
