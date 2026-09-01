<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Console\Domains\ApplicationKey;
use App\Console\Domains\Cache;
use App\Console\Domains\Database;
use App\Console\Domains\Storage;
use Illuminate\Console\Command;

class SetupCommand extends Command
{
    protected $signature = 'app:setup {--fresh : Wipe database and run fresh migrations} {--seed : Seed baseline data} {--optimize : Cache configurations, routes, and views for production} {--force : Force execution without confirmation}';

    protected $description = 'Bootstrap the application (generate key, link storage, clear caches, migrate, and seed production data)';

    public function handle(): int
    {
        $this->info('Starting application bootstrap...');

        $fresh = (bool) $this->option('fresh');
        $seed = (bool) $this->option('seed');
        $optimize = (bool) $this->option('optimize');

        ApplicationKey::generate($this);
        Cache::clear($this);
        Storage::link($this);

        Database::migrate($this, $fresh);

        if ($seed) {
            Database::seed($this);
        }

        if ($optimize) {
            Cache::build($this);
        }

        $this->info('✓ Setup completed successfully.');

        return self::SUCCESS;
    }
}
