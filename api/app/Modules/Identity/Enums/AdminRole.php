<?php

declare(strict_types=1);

namespace App\Modules\Identity\Enums;

use ArchTech\Enums\InvokableCases;
use ArchTech\Enums\Names;
use ArchTech\Enums\Options;
use ArchTech\Enums\Values;

/**
 * Palier de permission pour les opérations sensibles (remises en caisse,
 * remboursements...). `Admin::role` est une colonne texte libre existante,
 * jamais exploitée avant le module Caisse — cet enum lui donne enfin un sens
 * fermé. Le rôle historique `admin` reste explicitement SuperAdmin ; toute
 * autre valeur inconnue adopte le palier minimal pour éviter une élévation
 * de privilèges en cas de donnée invalide.
 */
enum AdminRole: string
{
    use InvokableCases;
    use Names;
    use Options;
    use Values;

    case Cashier = 'cashier';
    case Manager = 'manager';
    case SuperAdmin = 'super_admin';

    public static function fromColumn(?string $value): self
    {
        if ($value === 'admin') {
            return self::SuperAdmin;
        }

        return self::tryFrom((string) $value) ?? self::Cashier;
    }

    public function label(): string
    {
        return match ($this) {
            self::Cashier => 'Vendeur',
            self::Manager => 'Manager',
            self::SuperAdmin => 'Administrateur',
        };
    }
}
