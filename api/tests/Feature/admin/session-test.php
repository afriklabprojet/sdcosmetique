<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Identity\Models\Admin;

it('rejects unauthenticated access to the admin session', function (): void {
    $this->getJson('/api/admin/session')->assertUnauthorized();
});

it('forbids authenticated non-admin users', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user);

    $this->getJson('/api/admin/session')->assertForbidden();
});

it('returns the admin payload for an active admin', function (): void {
    $admin = Admin::factory()->create(['role' => 'admin']);

    $this->actingAs($admin->user);

    $this->getJson('/api/admin/session')
        ->assertOk()
        ->assertJsonPath('user.email', $admin->user->email)
        ->assertJsonPath('admin.role', 'admin')
        ->assertJsonPath('admin.root', true);
});

it('forbids a revoked admin', function (): void {
    $admin = Admin::factory()->revoked()->create();

    $this->actingAs($admin->user);

    $this->getJson('/api/admin/session')->assertForbidden();
});
