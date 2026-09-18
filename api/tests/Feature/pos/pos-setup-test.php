<?php

declare(strict_types=1);

use App\Modules\Identity\Models\Admin;
use App\Modules\Pos\Models\CashRegister;
use App\Modules\Pos\Models\CashRegisterSession;
use Database\Seeders\Pos\CashRegisterSeeder;
use Illuminate\Support\Facades\Hash;

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

it('restricts cashier accounts to their session identity and POS endpoints', function (): void {
    $cashier = admin(['role' => 'cashier', 'root_at' => null]);

    $this->actingAs($cashier)->getJson('/v1/admin/session')->assertOk();
    $this->actingAs($cashier)->getJson('/v1/admin/pos/products')->assertOk();
    $this->actingAs($cashier)->getJson('/v1/admin/pos/cashiers')->assertForbidden();
    $this->actingAs($cashier)->getJson('/v1/admin/orders')->assertForbidden();
});

it('lets an administrator manage individual cashier accounts', function (): void {
    $administrator = admin();

    $created = $this->actingAs($administrator)->postJson('/v1/admin/pos/cashiers', [
        'name' => 'Awa Caissière',
        'email' => 'awa.caisse@example.com',
        'password' => 'MotDePasse!2026',
        'password_confirmation' => 'MotDePasse!2026',
    ])->assertCreated()
        ->assertJsonPath('data.name', 'Awa Caissière')
        ->assertJsonPath('data.active', true);

    $cashier = Admin::query()->findOrFail($created->json('data.id'));

    expect(Hash::check('MotDePasse!2026', $cashier->user->password))->toBeTrue();

    $this->actingAs($administrator)->putJson('/v1/admin/pos/cashiers/'.$cashier->id, [
        'name' => 'Awa Koffi',
        'email' => 'awa.koffi@example.com',
        'password' => '',
        'password_confirmation' => '',
        'active' => true,
    ])->assertOk()->assertJsonPath('data.name', 'Awa Koffi');

    CashRegisterSession::factory()->for($cashier, 'admin')->create(['status' => 'open']);

    $this->actingAs($administrator)
        ->deleteJson('/v1/admin/pos/cashiers/'.$cashier->id)
        ->assertUnprocessable();

    CashRegisterSession::query()->where('admin_id', $cashier->id)->update(['status' => 'closed']);

    $this->actingAs($administrator)
        ->deleteJson('/v1/admin/pos/cashiers/'.$cashier->id)
        ->assertNoContent();

    expect($cashier->refresh()->active())->toBeFalse();
});
