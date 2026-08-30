<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class ModulesServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        foreach (config('modules.enabled', []) as $provider) {
            $this->app->register($provider);
        }
    }

    public function boot(): void {}
}
