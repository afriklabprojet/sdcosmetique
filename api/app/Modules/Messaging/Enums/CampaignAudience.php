<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Enums;

enum CampaignAudience: string
{
    case All = 'all';
    case Ordered = 'ordered';
    case NeverOrdered = 'never_ordered';
    case Active = 'active';
    case Inactive = 'inactive';
    case Manual = 'manual';
}
