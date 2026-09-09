<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

it('sends a reset link pointing at the frontend for a registered email', function (): void {
    Notification::fake();

    $user = User::factory()->create();

    $this->postJson('/forgot-password', ['email' => $user->email])->assertSuccessful();

    Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
        $url = $notification->toMail($user)->actionUrl;

        return str_starts_with($url, config('app.frontend_url').'/reset-password?token=')
            && str_contains($url, 'email='.urlencode($user->email));
    });
});

it('does not reveal whether an email is registered', function (): void {
    Notification::fake();

    $this->postJson('/forgot-password', ['email' => 'nobody@example.com'])->assertSuccessful();

    Notification::assertNothingSent();
});

it('resets the password with a valid broker token and lets the user log in with it', function (): void {
    $user = User::factory()->create();
    $token = Password::broker()->createToken($user);

    $this->postJson('/reset-password', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ])->assertSuccessful();

    $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertStatus(422);

    $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'new-secure-password',
    ])->assertSuccessful();
});

it('rejects a reset attempt with an invalid token', function (): void {
    $user = User::factory()->create();

    $this->postJson('/reset-password', [
        'token' => 'not-a-real-token',
        'email' => $user->email,
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ])->assertStatus(422);

    $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSuccessful();
});
