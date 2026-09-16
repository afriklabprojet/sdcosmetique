<?php

declare(strict_types=1);

use App\Modules\Identity\Enums\AdminRole;

it('preserves the legacy admin role as super admin', function (): void {
    expect(AdminRole::fromColumn('admin'))->toBe(AdminRole::SuperAdmin);
});

it('maps unknown or empty roles to the least privileged tier', function (): void {
    expect(AdminRole::fromColumn('unexpected-role'))->toBe(AdminRole::Cashier)
        ->and(AdminRole::fromColumn(null))->toBe(AdminRole::Cashier);
});
