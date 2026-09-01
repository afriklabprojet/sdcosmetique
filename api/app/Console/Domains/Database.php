<?php

declare(strict_types=1);

namespace App\Console\Domains;

use Illuminate\Console\Command;

final class Database
{
    public static function migrate(Command $console, bool $fresh): void
    {
        $console->comment('Migrating database...');
        $action = $fresh ? 'migrate:fresh' : 'migrate';

        $console->call($action, ['--force' => true]);
    }

    public static function seed(Command $console): void
    {
        $console->comment('Seeding baseline data...');
        $console->call('db:seed', ['--force' => true]);
    }
}
