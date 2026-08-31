<?php

declare(strict_types=1);

use App\Modules\Reviews\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

Route::get('reviews', [ReviewController::class, 'index'])->name('reviews.index');
Route::post('reviews', [ReviewController::class, 'store'])->name('reviews.store');
