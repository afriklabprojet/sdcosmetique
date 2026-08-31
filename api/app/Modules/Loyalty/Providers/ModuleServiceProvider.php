<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Providers;

use App\Models\User;
use App\Modules\Loyalty\Enums\LoyaltyReason;
use App\Modules\Loyalty\Models\Account;
use App\Modules\Loyalty\Models\Entry;
use App\Modules\Loyalty\Policies\AccountPolicy;
use App\Modules\Loyalty\Policies\EntryPolicy;
use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'loyalty';
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [
            Account::class => AccountPolicy::class,
            Entry::class => EntryPolicy::class,
        ];
    }

    public function boot(): void
    {
        parent::boot();

        Event::listen(Registered::class, function (Registered $event): void {
            $user = $event->user;

            if (! $user instanceof User) {
                return;
            }

            $client = $user->client;

            if ($client === null) {
                return;
            }

            Account::for($client)->credit(
                20,
                LoyaltyReason::SignupBonus,
                'Welcome bonus',
                'user',
                (string) $user->id,
            );
        });
    }
}
