<?php

declare(strict_types=1);

use App\Models\User;

it('returns a null user for an unauthenticated session request', function (): void {
    $this->getJson('/v1/session')
        ->assertOk()
        ->assertJsonPath('user', null);
});

it('authenticates the api with a session cookie', function (): void {
    $user = User::factory()->create();

    $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSuccessful();

    $this->getJson('/v1/session')
        ->assertOk()
        ->assertJsonPath('user.email', $user->email);
});
