<?php

declare(strict_types=1);

use App\Modules\Content\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

Route::get('pages/{page:slug}', [PageController::class, 'show'])
    ->where('page', '[a-z0-9-]+')
    ->name('pages.show');
