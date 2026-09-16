<?php

declare(strict_types=1);

namespace App\Modules\Pos\Domain;

use App\Modules\Identity\Enums\AdminRole;
use App\Modules\Identity\Models\Admin;
use App\Modules\Settings\Models\Setting;

/**
 * Plafond de remise autorisé en caisse selon le palier de l'admin (§8) —
 * configurable via le réglage `pos_discount_limits` (pourcentage max du
 * sous-total, null = illimité), avec des valeurs par défaut raisonnables si
 * le réglage n'a jamais été enregistré.
 */
class DiscountPolicy
{
    private const array DEFAULT_LIMITS = [
        'cashier' => 10,
        'manager' => 30,
        'super_admin' => null,
    ];

    /** Pourcentage maximal (0-100) autorisé pour ce palier, ou null si illimité. */
    public function maxPercentFor(AdminRole $tier): ?int
    {
        $limits = $this->limits();
        $value = $limits[$tier->value] ?? self::DEFAULT_LIMITS[$tier->value] ?? null;

        return $value === null ? null : (int) $value;
    }

    public function allows(Admin $admin, int $discountAmount, int $subtotal): bool
    {
        if ($discountAmount <= 0 || $subtotal <= 0) {
            return true;
        }

        $max = $this->maxPercentFor($admin->tier());

        if ($max === null) {
            return true;
        }

        return ($discountAmount / $subtotal) * 100 <= $max + 0.0001;
    }

    /**
     * @return array<string, int|null>
     */
    private function limits(): array
    {
        $stored = Setting::query()->where('key', 'pos_discount_limits')->value('value');

        return is_array($stored) ? $stored : self::DEFAULT_LIMITS;
    }
}
