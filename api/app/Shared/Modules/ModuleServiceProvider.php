<?php

declare(strict_types=1);

namespace App\Shared\Modules;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

abstract class ModuleServiceProvider extends ServiceProvider
{
    abstract public function name(): string;

    public function viewsPath(): ?string
    {
        $path = $this->modulePath('Resources/views');

        return is_dir($path) ? $path : null;
    }

    public function viewsNamespace(): string
    {
        return $this->name();
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [];
    }

    public function configFile(): ?string
    {
        $path = $this->modulePath('Config/'.$this->name().'.php');

        return is_file($path) ? $path : null;
    }

    public function register(): void
    {
        $config = $this->configFile();

        if ($config !== null) {
            $this->mergeConfigFrom($config, 'modules.'.$this->name());
        }
    }

    public function boot(): void
    {
        $views = $this->viewsPath();

        if ($views !== null) {
            $this->loadViewsFrom($views, $this->viewsNamespace());
        }

        foreach ($this->policies() as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }

    protected function modulePath(string $relative): string
    {
        $reflection = new \ReflectionClass($this);

        return dirname($reflection->getFileName() ?: '', 2).DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $relative);
    }
}
