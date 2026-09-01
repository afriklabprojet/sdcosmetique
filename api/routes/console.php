<?php

declare(strict_types=1);

use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Console\ReconcilePaymentsCommand;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Console\Command;
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

Artisan::command('app:setup {--fresh : Wipe database and run fresh migrations} {--no-seed : Do not run database seeders} {--optimize : Cache configurations, routes, and views for production} {--force : Force execution without confirmation}', function (): int {
    $this->info('Starting SD Cosmétique application bootstrap...');

    // 1. Application Key
    if (empty(config('app.key'))) {
        $this->comment('Generating application key (APP_KEY)...');
        $this->call('key:generate', ['--force' => true]);
    } else {
        $this->line('✓ Application key is already configured.');
    }

    // 2. Clear cached bootstrap configurations
    $this->comment('Clearing cached optimizations...');
    $this->call('optimize:clear');

    // 3. Storage link
    $this->comment('Linking storage directory to public...');
    $this->call('storage:link');

    // 4. Database Migrations
    if ($this->option('fresh')) {
        $this->comment('Running fresh database migrations...');
        $this->call('migrate:fresh', ['--force' => true]);
    } else {
        $this->comment('Running database migrations...');
        $this->call('migrate', ['--force' => true]);
    }

    // 5. Seed Production Baseline Data
    if (! $this->option('no-seed')) {
        $this->comment('Seeding production baseline data...');
        $this->call('db:seed', [
            '--class' => DatabaseSeeder::class,
            '--force' => true,
        ]);
    }

    // 6. Production Optimization Cache
    if ($this->option('optimize')) {
        $this->comment('Caching config, routes, and views for production...');
        $this->call('optimize');
    }

    $this->info('✓ Application setup completed successfully.');

    return Command::SUCCESS;
})->purpose('Bootstrap the application (generate key, link storage, clear caches, migrate, and seed production data)');

Schedule::command('orders:prune-drafts')->daily();
Schedule::command(ReconcilePaymentsCommand::class)->everyFifteenMinutes()->withoutOverlapping();
