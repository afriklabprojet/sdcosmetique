<?php

declare(strict_types=1);

use App\Modules\Loyalty\Http\Controllers\EntryController;
use Illuminate\Support\Facades\Route;

Route::get('loyalty-entries', [EntryController::class, 'index'])->name('loyalty-entries.index');
Route::post('loyalty-entries', [EntryController::class, 'store'])->name('loyalty-entries.store');
