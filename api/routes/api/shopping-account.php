<?php

declare(strict_types=1);

use App\Modules\Shopping\Http\Controllers\ComparisonController;
use App\Modules\Shopping\Http\Controllers\ComparisonItemController;
use App\Modules\Shopping\Http\Controllers\WishlistController;
use App\Modules\Shopping\Http\Controllers\WishlistItemController;
use Illuminate\Support\Facades\Route;

Route::get('account/wishlist', [WishlistController::class, 'show'])->name('wishlist.show');
Route::apiResource('wishlist-items', WishlistItemController::class)->only(['store', 'destroy']);

Route::get('comparison', [ComparisonController::class, 'show'])->name('comparison.show');
Route::delete('comparison', [ComparisonController::class, 'destroy'])->name('comparison.destroy');
Route::apiResource('comparison-items', ComparisonItemController::class)->only(['store', 'destroy']);
