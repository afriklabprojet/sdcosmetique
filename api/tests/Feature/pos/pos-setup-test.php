<?php

declare(strict_types=1);

use App\Modules\Pos\Models\CashRegister;
use Database\Seeders\Pos\CashRegisterSeeder;

it('provisions one active default register idempotently', function (): void {
    $this->seed(CashRegisterSeeder::class);
    $this->seed(CashRegisterSeeder::class);

    expect(CashRegister::query()->count())->toBe(1)
        ->and(CashRegister::query()->first()?->name)->toBe('Caisse principale')
        ->and(CashRegister::query()->first()?->active)->toBeTrue();
});

it('reactivates the default register when it was disabled', function (): void {
    CashRegister::factory()->create([
        'name' => 'Caisse principale',
        'location' => 'Ancienne boutique',
        'active' => false,
    ]);

    $this->seed(CashRegisterSeeder::class);

    expect(CashRegister::query()->count())->toBe(1)
        ->and(CashRegister::query()->first()?->location)->toBe('Boutique')
        ->and(CashRegister::query()->first()?->active)->toBeTrue();
});
