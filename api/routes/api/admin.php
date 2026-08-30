<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\MetricsController;
use App\Modules\Accounts\Http\Controllers\Admin\CustomerController;
use App\Modules\Catalog\Http\Controllers\Admin\CategoryController;
use App\Modules\Catalog\Http\Controllers\Admin\MediaController;
use App\Modules\Catalog\Http\Controllers\Admin\ProductController;
use App\Modules\Content\Http\Controllers\Admin\BannerController;
use App\Modules\Content\Http\Controllers\Admin\PageController;
use App\Modules\Identity\Http\Controllers\Admin\SessionController;
use App\Modules\Leads\Http\Controllers\Admin\ContactMessageController;
use App\Modules\Leads\Http\Controllers\Admin\NewsletterSubscriptionController;
use App\Modules\Orders\Http\Controllers\Admin\DeliveryMethodController;
use App\Modules\Orders\Http\Controllers\Admin\OrderController;
use App\Modules\Payments\Http\Controllers\Admin\NotificationController;
use App\Modules\Payments\Http\Controllers\Admin\PaymentController;
use App\Modules\Shopping\Http\Controllers\Admin\CouponController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function (): void {
    Route::get('session', [SessionController::class, 'show'])->name('session.show');

    Route::get('metrics/overview', [MetricsController::class, 'overview'])->name('metrics.overview');

    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('customers/{client}', [CustomerController::class, 'show'])->name('customers.show');

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::post('media', [MediaController::class, 'store'])->name('media.store');

    Route::apiResource('banners', BannerController::class);
    Route::apiResource('pages', PageController::class);

    Route::get('contact-messages', [ContactMessageController::class, 'index'])->name('contact-messages.index');
    Route::get('contact-messages/{contactMessage}', [ContactMessageController::class, 'show'])->name('contact-messages.show');
    Route::patch('contact-messages/{contactMessage}', [ContactMessageController::class, 'update'])->name('contact-messages.update');

    Route::get('newsletter-subscriptions', [NewsletterSubscriptionController::class, 'index'])->name('newsletter-subscriptions.index');
    Route::delete('newsletter-subscriptions/{newsletterSubscription}', [NewsletterSubscriptionController::class, 'destroy'])->name('newsletter-subscriptions.destroy');

    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    Route::post('orders/{order}/adjustments', [OrderController::class, 'storeAdjustment'])->name('orders.adjustments.store');

    Route::apiResource('delivery-methods', DeliveryMethodController::class)->parameter('delivery-methods', 'deliveryMethod');

    Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');

    Route::get('payment-notifications', [NotificationController::class, 'index'])->name('payment-notifications.index');
    Route::get('payment-notifications/{paymentNotification}', [NotificationController::class, 'show'])->name('payment-notifications.show');

    Route::apiResource('coupons', CouponController::class);
});
