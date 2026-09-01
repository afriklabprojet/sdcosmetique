<?php

declare(strict_types=1);

namespace App\Console\Domains;

use Illuminate\Console\Command;

final class ApplicationKey
{
    public static function generate(Command $console): void
    {
        if (empty(config('app.key'))) {
            $console->comment('Generating application key...');
            $console->call('key:generate', ['--force' => true]);
        } else {
            $console->line('✓ Application key is ready.');
        }
    }
}
