<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\MetricsController;
use App\Modules\Accounts\Http\Controllers\Admin\CustomerController;
use App\Modules\Catalog\Http\Controllers\Admin\CategoryController;
use App\Modules\Catalog\Http\Controllers\Admin\MediaController;
use App\Modules\Catalog\Http\Controllers\Admin\ProductController;
use App\Modules\Content\Http\Controllers\Admin\PageController;
use App\Modules\Identity\Http\Controllers\Admin\SessionController;
use App\Modules\Invoicing\Http\Controllers\Admin\InvoiceController;
use App\Modules\Leads\Http\Controllers\Admin\ContactMessageController;
use App\Modules\Leads\Http\Controllers\Admin\NewsletterSubscriptionController;
use App\Modules\Loyalty\Http\Controllers\Admin\AccountController as LoyaltyAccountController;
use App\Modules\Loyalty\Http\Controllers\Admin\AdjustmentController as LoyaltyAdjustmentController;
use App\Modules\Loyalty\Http\Controllers\Admin\EntryController as LoyaltyEntryController;
use App\Modules\Messaging\Http\Controllers\Admin\CustomerMessageController;
use App\Modules\Messaging\Http\Controllers\Admin\MarketingCampaignController;
use App\Modules\Orders\Http\Controllers\Admin\DeliveryMethodController;
use App\Modules\Orders\Http\Controllers\Admin\OrderController;
use App\Modules\Payments\Http\Controllers\Admin\NotificationController;
use App\Modules\Payments\Http\Controllers\Admin\PaymentController;
use App\Modules\Pos\Http\Controllers\Admin\CashierController;
use App\Modules\Pos\Http\Controllers\Admin\CashRegisterController;
use App\Modules\Pos\Http\Controllers\Admin\ProductSearchController as PosProductSearchController;
use App\Modules\Pos\Http\Controllers\Admin\ReportController as PosReportController;
use App\Modules\Pos\Http\Controllers\Admin\SaleController as PosSaleController;
use App\Modules\Pos\Http\Controllers\Admin\SaleCsvExportController;
use App\Modules\Pos\Http\Controllers\Admin\SalePdfExportController;
use App\Modules\Pos\Http\Controllers\Admin\SaleReceiptController;
use App\Modules\Quiz\Http\Controllers\Admin\QuestionController as QuizQuestionController;
use App\Modules\Quiz\Http\Controllers\Admin\SubmissionController as QuizSubmissionController;
use App\Modules\Reviews\Http\Controllers\Admin\ReviewController;
use App\Modules\Settings\Http\Controllers\Admin\SettingController;
use App\Modules\Shopping\Http\Controllers\Admin\CouponController;
use App\Modules\Testimonials\Http\Controllers\Admin\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function (): void {
    Route::get('session', [SessionController::class, 'show'])->name('session.show');

    Route::get('metrics/overview', [MetricsController::class, 'overview'])->name('metrics.overview');

    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('customers/{client}', [CustomerController::class, 'show'])->name('customers.show');
    Route::get('customers/{client}/orders', [CustomerController::class, 'orders'])->name('customers.orders');
    Route::post('customers/{client}/messages', [CustomerMessageController::class, 'store'])->name('customers.messages.store');

    // Historique client (fiche client, §4) et « Messages envoyés » globaux (§11) partagent le
    // même endpoint : ?client_id= filtre sur un seul client, absent = liste globale.
    Route::get('messages', [CustomerMessageController::class, 'index'])->name('messages.index');
    Route::get('messages/{customerMessage}', [CustomerMessageController::class, 'show'])->name('messages.show');
    Route::post('messages/{customerMessage}/resend', [CustomerMessageController::class, 'resend'])->name('messages.resend');

    // Marketing Bulk (§6-§9) — campagnes groupées, distinctes des messages individuels ci-dessus.
    Route::post('marketing-campaigns/audience-count', [MarketingCampaignController::class, 'audienceCount'])->name('marketing-campaigns.audience-count');
    Route::get('marketing-campaigns', [MarketingCampaignController::class, 'index'])->name('marketing-campaigns.index');
    Route::post('marketing-campaigns', [MarketingCampaignController::class, 'store'])->name('marketing-campaigns.store');
    Route::get('marketing-campaigns/{campaign}', [MarketingCampaignController::class, 'show'])->name('marketing-campaigns.show');
    Route::patch('marketing-campaigns/{campaign}', [MarketingCampaignController::class, 'update'])->name('marketing-campaigns.update');
    Route::delete('marketing-campaigns/{campaign}', [MarketingCampaignController::class, 'destroy'])->name('marketing-campaigns.destroy');
    Route::get('marketing-campaigns/{campaign}/preview', [MarketingCampaignController::class, 'preview'])->name('marketing-campaigns.preview');
    Route::get('marketing-campaigns/{campaign}/recipients', [MarketingCampaignController::class, 'recipients'])->name('marketing-campaigns.recipients');
    Route::post('marketing-campaigns/{campaign}/send-test', [MarketingCampaignController::class, 'sendTest'])->name('marketing-campaigns.send-test');
    Route::post('marketing-campaigns/{campaign}/send', [MarketingCampaignController::class, 'send'])->name('marketing-campaigns.send');
    Route::post('marketing-campaigns/{campaign}/cancel', [MarketingCampaignController::class, 'cancel'])->name('marketing-campaigns.cancel');
    Route::post('marketing-campaigns/{campaign}/retry-failed', [MarketingCampaignController::class, 'retryFailed'])->name('marketing-campaigns.retry-failed');
    Route::post('marketing-campaigns/{campaign}/duplicate', [MarketingCampaignController::class, 'duplicate'])->name('marketing-campaigns.duplicate');

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::post('media', [MediaController::class, 'store'])->name('media.store');

    Route::apiResource('pages', PageController::class);

    Route::get('contact-messages', [ContactMessageController::class, 'index'])->name('contact-messages.index');
    Route::get('contact-messages/{contactMessage}', [ContactMessageController::class, 'show'])->name('contact-messages.show');
    Route::patch('contact-messages/{contactMessage}', [ContactMessageController::class, 'update'])->name('contact-messages.update');

    Route::get('newsletter-subscriptions', [NewsletterSubscriptionController::class, 'index'])->name('newsletter-subscriptions.index');
    Route::patch('newsletter-subscriptions/{newsletterSubscription}', [NewsletterSubscriptionController::class, 'update'])->name('newsletter-subscriptions.update');
    Route::delete('newsletter-subscriptions/{newsletterSubscription}', [NewsletterSubscriptionController::class, 'destroy'])->name('newsletter-subscriptions.destroy');

    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    // Avant `orders/{order}` : sinon "unpaid" est capturé comme identifiant de commande.
    Route::delete('orders/unpaid', [OrderController::class, 'destroyUnpaid'])->name('orders.destroy-unpaid');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    Route::delete('orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');
    Route::post('orders/{order}/adjustments', [OrderController::class, 'storeAdjustment'])->name('orders.adjustments.store');

    Route::get('invoice-preview', [InvoiceController::class, 'preview'])->name('invoice.preview');

    Route::get('orders/{order}/invoice/status', [InvoiceController::class, 'status'])->name('orders.invoice.status');
    Route::get('orders/{order}/invoice', [InvoiceController::class, 'show'])->name('orders.invoice.show');
    Route::get('orders/{order}/invoice/download', [InvoiceController::class, 'download'])->name('orders.invoice.download');
    Route::post('orders/{order}/invoice/send', [InvoiceController::class, 'send'])->name('orders.invoice.send');

    Route::apiResource('delivery-methods', DeliveryMethodController::class)->parameter('delivery-methods', 'deliveryMethod');

    Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');

    Route::get('payment-notifications', [NotificationController::class, 'index'])->name('payment-notifications.index');
    Route::get('payment-notifications/{paymentNotification}', [NotificationController::class, 'show'])->name('payment-notifications.show');

    Route::apiResource('coupons', CouponController::class);

    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::get('settings/{setting}', [SettingController::class, 'show'])
        ->where('setting', '[a-z0-9_]+')
        ->name('settings.show');
    Route::patch('settings/{setting}', [SettingController::class, 'update'])
        ->where('setting', '[a-z0-9_]+')
        ->name('settings.update');

    Route::apiResource('testimonials', TestimonialController::class);
    Route::get('reviews', [ReviewController::class, 'index'])->name('reviews.index');
    Route::get('reviews/{review}', [ReviewController::class, 'show'])->name('reviews.show');
    Route::patch('reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
    Route::delete('reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');

    Route::apiResource('quiz-questions', QuizQuestionController::class)->parameters(['quiz-questions' => 'question']);
    Route::get('quiz-submissions', [QuizSubmissionController::class, 'index'])->name('quiz-submissions.index');

    Route::get('loyalty/accounts', [LoyaltyAccountController::class, 'index'])->name('loyalty.accounts.index');
    Route::get('loyalty/entries', [LoyaltyEntryController::class, 'index'])->name('loyalty.entries.index');
    Route::post('loyalty/adjustments', [LoyaltyAdjustmentController::class, 'store'])->name('loyalty.adjustments.store');

    // Module Caisse / POS — réutilise Product, Order, Payment existants (voir AGENTS.md).
    Route::prefix('pos')->name('pos.')->group(function (): void {
        Route::apiResource('cashiers', CashierController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::get('products', [PosProductSearchController::class, 'index'])->name('products.index');
        Route::get('products/barcode/{barcode}', [PosProductSearchController::class, 'byBarcode'])->name('products.barcode');

        Route::get('registers', [CashRegisterController::class, 'index'])->name('registers.index');
        Route::get('sessions/current', [CashRegisterController::class, 'current'])->name('sessions.current');
        Route::post('sessions/open', [CashRegisterController::class, 'open'])->name('sessions.open');
        Route::post('sessions/{session}/close', [CashRegisterController::class, 'close'])->name('sessions.close');

        Route::get('sales', [PosSaleController::class, 'index'])->name('sales.index');
        Route::get('sales/export/pdf', [SalePdfExportController::class, 'index'])->name('sales.export.pdf');
        Route::get('sales/export/csv', [SaleCsvExportController::class, 'index'])->name('sales.export.csv');
        Route::post('sales', [PosSaleController::class, 'store'])->name('sales.store');
        Route::get('sales/{order}', [PosSaleController::class, 'show'])->name('sales.show');
        Route::get('sales/{order}/receipt', [SaleReceiptController::class, 'show'])->name('sales.receipt.show');
        Route::get('sales/{order}/receipt/pdf', [SaleReceiptController::class, 'pdf'])->name('sales.receipt.pdf');
        Route::post('sales/{order}/refund', [PosSaleController::class, 'refund'])->name('sales.refund');
        Route::delete('sales/{order}', [PosSaleController::class, 'destroy'])->name('sales.destroy');

        Route::get('reports/daily', [PosReportController::class, 'daily'])->name('reports.daily');
        Route::get('reports/summary', [PosReportController::class, 'summary'])->name('reports.summary');
    });
});
