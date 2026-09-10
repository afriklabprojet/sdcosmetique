<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Enums;

enum CampaignStatus: string
{
    case Draft = 'draft';
    case Scheduled = 'scheduled';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Failed = 'failed';
    case Cancelled = 'cancelled';
}
