<?php

declare(strict_types=1);

namespace App\Modules\Pos\Enums;

use ArchTech\Enums\InvokableCases;
use ArchTech\Enums\Names;
use ArchTech\Enums\Options;
use ArchTech\Enums\Values;

/**
 * Moyens de règlement acceptés au comptoir. Distinct de
 * `App\Modules\Payments\Enums\PaymentMethod` (celui-ci décrit les mobile
 * money branchés sur le PSP Jeko pour le paiement en ligne, avec redirection
 * asynchrone) — au comptoir le règlement est immédiat, sans PSP ni
 * redirection, d'où une liste et une sémantique distinctes.
 */
enum PosTenderMethod: string
{
    use InvokableCases;
    use Names;
    use Options;
    use Values;

    case Cash = 'cash';
    case Card = 'card';
    case OrangeMoney = 'orange_money';
    case Wave = 'wave';
    case MtnMomo = 'mtn_momo';
    case MoovMoney = 'moov_money';
    /** Paiement réel via Jeko (lien/QR, confirmation asynchrone par webhook) — distinct des tenders déclaratifs ci-dessus. */
    case Jeko = 'jeko';

    /**
     * Valeur stockée dans `payment_attempts.gateway`. Le cas Jeko n'est pas
     * préfixé : il doit correspondre exactement à `JekoTerminal::name()`
     * pour que `Terminals` et le webhook `/webhooks/jeko` le routent
     * correctement — ce n'est pas un simple tender déclaratif comme les
     * autres.
     */
    public function gateway(): string
    {
        return $this === self::Jeko ? $this->value : 'pos_'.$this->value;
    }

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Espèces',
            self::Card => 'Carte bancaire',
            self::OrangeMoney => 'Orange Money',
            self::Wave => 'Wave',
            self::MtnMomo => 'MTN MoMo',
            self::MoovMoney => 'Moov Money',
            self::Jeko => 'Jeko',
        };
    }
}
