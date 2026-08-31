<?php

declare(strict_types=1);

use App\Modules\Testimonials\Http\Controllers\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::get('testimonials', [TestimonialController::class, 'index'])->name('testimonials.index');
Route::post('testimonials', [TestimonialController::class, 'store'])->name('testimonials.store');
