<?php

declare(strict_types=1);

namespace App\Modules\Payments\Providers;

use App\Modules\Payments\Console\ReconcilePaymentsCommand;
use App\Modules\Payments\Domain\Terminal;
use App\Modules\Payments\Domain\Terminals;
use App\Modules\Payments\Gateways\CinetPayTerminal;
use App\Modules\Payments\Gateways\JekoTerminal;
use App\Modules\Payments\Gateways\NullTerminal;
use App\Modules\Payments\Models\Payment;
use App\Modules\Payments\Models\Payment\Notification;
use App\Modules\Payments\Policies\NotificationPolicy;
use App\Modules\Payments\Policies\PaymentPolicy;
use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'payments';
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [
            Payment::class => PaymentPolicy::class,
            Notification::class => NotificationPolicy::class,
        ];
    }

    public function register(): void
    {
        parent::register();

        $this->app->singleton(Terminals::class, function (): Terminals {
            $registry = new Terminals;
            foreach ((array) config('payments.gateways', []) as $name => $terminal) {
                $registry->register($name, $terminal);
            }

            return $registry;
        });

        $this->app->bind(Terminal::class, function ($app): Terminal {
            return $app->make(Terminals::class)->default();
        });
    }

    public function boot(): void
    {
        parent::boot();

        if ($this->app->runningInConsole()) {
            $this->commands([ReconcilePaymentsCommand::class]);
        }
    }
}
