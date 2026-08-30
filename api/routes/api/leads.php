<?php

declare(strict_types=1);

use App\Modules\Leads\Http\Controllers\ContactMessageController;
use App\Modules\Leads\Http\Controllers\NewsletterSubscriptionController;
use Illuminate\Support\Facades\Route;

Route::apiResource('newsletter-subscriptions', NewsletterSubscriptionController::class)->only(['store']);
Route::apiResource('contact-messages', ContactMessageController::class)->only(['store']);
