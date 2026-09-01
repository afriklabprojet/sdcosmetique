<?php

declare(strict_types=1);

namespace App\Console\Domains;

use Illuminate\Console\Command;

final class Storage
{
    public static function link(Command $console): void
    {
        $console->comment('Linking storage directory...');
        $console->call('storage:link', ['--force' => true]);
    }
}
