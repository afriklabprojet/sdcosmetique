<?php

declare(strict_types=1);

namespace App\Modules\Orders\Providers;

use App\Modules\Orders\Domain\Drafts;
use App\Modules\Orders\Models\Order;
use App\Modules\Orders\Policies\OrderPolicy;
use App\Modules\Shopping\Events\GuestCartMerged;
use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;
use Illuminate\Support\Facades\Event;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'orders';
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [
            Order::class => OrderPolicy::class,
        ];
    }

    public function boot(): void
    {
        parent::boot();

        Event::listen(GuestCartMerged::class, function (GuestCartMerged $event): void {
            Drafts::adopt($event->guest, $event->survivor);
        });
    }
}
