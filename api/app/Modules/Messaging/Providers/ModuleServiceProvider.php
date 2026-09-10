<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Providers;

use App\Modules\Messaging\Models\CustomerMessage;
use App\Modules\Messaging\Models\MarketingCampaign;
use App\Modules\Messaging\Policies\CustomerMessagePolicy;
use App\Modules\Messaging\Policies\MarketingCampaignPolicy;
use App\Shared\Modules\ModuleServiceProvider as BaseModuleServiceProvider;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    public function name(): string
    {
        return 'messaging';
    }

    /**
     * @return array<class-string, class-string>
     */
    public function policies(): array
    {
        return [
            CustomerMessage::class => CustomerMessagePolicy::class,
            MarketingCampaign::class => MarketingCampaignPolicy::class,
        ];
    }
}
