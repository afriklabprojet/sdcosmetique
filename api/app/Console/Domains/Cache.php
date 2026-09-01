<?php

declare(strict_types=1);

namespace App\Console\Domains;

use Illuminate\Console\Command;

final class Cache
{
    public static function clear(Command $console): void
    {
        $console->comment('Clearing optimizations...');
        $console->call('optimize:clear');
    }

    public static function build(Command $console): void
    {
        $console->comment('Caching production assets...');
        $console->call('optimize');
    }
}
