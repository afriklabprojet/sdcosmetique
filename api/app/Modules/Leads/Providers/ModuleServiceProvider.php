<?php

declare(strict_types=1);

namespace App\Modules\Leads\Providers;

use App\Modules\Leads\Models\Contact\Message;
use App\Modules\Leads\Models\Newsletter\Subscription;
use App\Modules\Leads\Policies\ContactMessagePolicy;
use App\Modules\Leads\Policies\NewsletterSubscriptionPolicy;
use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'leads';
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [
            Subscription::class => NewsletterSubscriptionPolicy::class,
            Message::class => ContactMessagePolicy::class,
        ];
    }
}
