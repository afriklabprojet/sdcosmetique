<?php

declare(strict_types=1);

namespace App\Modules\Payments\Providers;

use App\Modules\Payments\Console\ReconcilePaymentsCommand;
use App\Modules\Payments\Gateways\CinetPayGateway;
use App\Modules\Payments\Gateways\NullGateway;
use App\Modules\Payments\Gateways\PaymentGateway;
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

        $this->app->bind(PaymentGateway::class, function (): PaymentGateway {
            if (config('payments.driver') === 'cinetpay' && filled(config('payments.cinetpay.api_key'))) {
                return new CinetPayGateway;
            }

            return new NullGateway;
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
