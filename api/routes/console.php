<?php

declare(strict_types=1);

use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Console\ReconcilePaymentsCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function (): void {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('orders:prune-drafts', function (): void {
    $deleted = Order::query()
        ->whereNull('placed_at')
        ->where('created_at', '<', now()->subDays(7))
        ->delete();

    $this->info("Deleted {$deleted} draft orders older than 7 days.");
})->purpose('Delete checkout drafts older than 7 days');

Schedule::command('orders:prune-drafts')->daily();
Schedule::command(ReconcilePaymentsCommand::class)->everyFifteenMinutes()->withoutOverlapping();
