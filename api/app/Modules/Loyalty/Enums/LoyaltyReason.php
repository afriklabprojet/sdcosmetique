<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Enums;

enum LoyaltyReason: string
{
    use \ArchTech\Enums\InvokableCases;
    use \ArchTech\Enums\Names;
    use \ArchTech\Enums\Options;
    use \ArchTech\Enums\Values;

    case OrderReward = 'order_reward';
    case SignupBonus = 'signup_bonus';
    case QuizCompletion = 'quiz_completion';
    case ProductReview = 'product_review';
    case PointsRedemption = 'points_redemption';
    case TierBonus = 'tier_bonus';
    case AdminAdjustment = 'admin_adjustment';
    case Expiration = 'expiration';
}
