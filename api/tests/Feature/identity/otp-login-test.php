<?php

declare(strict_types=1);

use App\Mail\OtpLoginMail;
use App\Models\User;
use App\Modules\Identity\Domain\OtpBroker;
use App\Modules\Identity\Models\LoginOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

/**
 * Connexion en deux étapes (§5-9) : /login/check révèle volontairement
 * l'existence du compte (comportement demandé, §5-7), tandis que
 * /login/otp reste générique (§9) — les deux comportements sont couverts
 * séparément ci-dessous pour ne pas les confondre.
 */
it('reveals account existence and password state at the login-check step', function (): void {
    User::factory()->create(['email' => 'avecmdp@example.com', 'password' => 'secret-password']);
    User::factory()->create(['email' => 'sansmdp@example.com', 'password' => null]);

    $this->postJson('/login/check', ['email' => 'avecmdp@example.com'])
        ->assertOk()
        ->assertJson(['exists' => true, 'has_password' => true]);

    $this->postJson('/login/check', ['email' => 'sansmdp@example.com'])
        ->assertOk()
        ->assertJson(['exists' => true, 'has_password' => false]);

    $this->postJson('/login/check', ['email' => 'inconnu@example.com'])
        ->assertOk()
        ->assertJson(['exists' => false, 'has_password' => false]);
});

it('logs in a passwordless auto-created account using an emailed OTP', function (): void {
    Mail::fake();

    $user = User::factory()->create(['email' => 'client@example.com', 'password' => null]);

    $this->postJson('/login/otp', ['email' => 'client@example.com'])->assertOk();

    Mail::assertSent(OtpLoginMail::class, fn (OtpLoginMail $mail): bool => $mail->user->is($user));

    // Le code n'est jamais stocké/loggé en clair : on ne peut le récupérer
    // qu'en interceptant l'e-mail réellement envoyé, comme un client le ferait.
    $code = null;
    Mail::assertSent(OtpLoginMail::class, function (OtpLoginMail $mail) use (&$code): bool {
        $code = $mail->code;

        return true;
    });

    $this->postJson('/login/otp/verify', ['email' => 'client@example.com', 'code' => $code])
        ->assertOk()
        ->assertJson(['two_factor' => false]);

    $this->assertAuthenticatedAs($user);
});

it('logs in a client who already has a password using that password', function (): void {
    $user = User::factory()->create(['email' => 'motdepasse@example.com', 'password' => 'correct-password']);

    $this->postJson('/login', ['email' => 'motdepasse@example.com', 'password' => 'correct-password'])
        ->assertOk();

    $this->assertAuthenticatedAs($user);
});

it('still allows a password-holding client to log in via emailed OTP', function (): void {
    Mail::fake();

    $user = User::factory()->create(['email' => 'les-deux@example.com', 'password' => 'correct-password']);

    $this->postJson('/login/otp', ['email' => 'les-deux@example.com'])->assertOk();

    $sentCode = null;
    Mail::assertSent(OtpLoginMail::class, function (OtpLoginMail $mail) use (&$sentCode): bool {
        $sentCode = $mail->code;

        return true;
    });

    $this->postJson('/login/otp/verify', ['email' => 'les-deux@example.com', 'code' => $sentCode])
        ->assertOk();

    $this->assertAuthenticatedAs($user);
});

it('rejects a wrong OTP code', function (): void {
    $user = User::factory()->create(['email' => 'test@example.com']);
    app(OtpBroker::class)->issue($user);

    $this->postJson('/login/otp/verify', ['email' => 'test@example.com', 'code' => '000000'])
        ->assertStatus(422);

    $this->assertGuest();
});

it('rejects an expired OTP code', function (): void {
    $user = User::factory()->create(['email' => 'expire@example.com']);
    $code = app(OtpBroker::class)->issue($user);

    LoginOtp::query()->where('user_id', $user->id)->update(['expires_at' => now()->subMinute()]);

    $this->postJson('/login/otp/verify', ['email' => 'expire@example.com', 'code' => $code])
        ->assertStatus(422);

    $this->assertGuest();
});

it('rejects an OTP code that was already used once', function (): void {
    $user = User::factory()->create(['email' => 'dejautilise@example.com']);
    $code = app(OtpBroker::class)->issue($user);

    $this->postJson('/login/otp/verify', ['email' => 'dejautilise@example.com', 'code' => $code])
        ->assertOk();

    auth()->logout();

    $this->postJson('/login/otp/verify', ['email' => 'dejautilise@example.com', 'code' => $code])
        ->assertStatus(422);

    $this->assertGuest();
});

it('invalidates the previous OTP when a new one is requested after the cooldown', function (): void {
    Mail::fake();

    $user = User::factory()->create(['email' => 'renvoi@example.com']);

    $firstCode = app(OtpBroker::class)->issue($user);
    $firstOtp = LoginOtp::query()->where('user_id', $user->id)->latest('id')->first();

    // Simule l'écoulement du délai de renvoi pour ne pas tester le throttle lui-même.
    // `created_at` n'est pas fillable (LoginOtp ne l'expose pas), d'où forceFill().
    $firstOtp->forceFill(['created_at' => now()->subMinutes(5)])->save();

    $secondCode = app(OtpBroker::class)->issue($user);

    expect($firstOtp->fresh()->used())->toBeTrue();

    $this->postJson('/login/otp/verify', ['email' => 'renvoi@example.com', 'code' => $firstCode])
        ->assertStatus(422);

    $this->postJson('/login/otp/verify', ['email' => 'renvoi@example.com', 'code' => $secondCode])
        ->assertOk();

    $this->assertAuthenticatedAs($user);
});

it('never reveals whether an account exists when requesting an OTP', function (): void {
    Mail::fake();

    $known = $this->postJson('/login/otp', ['email' => 'inconnu-otp@example.com'])->assertOk();
    User::factory()->create(['email' => 'connu-otp@example.com']);
    $unknown = $this->postJson('/login/otp', ['email' => 'connu-otp@example.com'])->assertOk();

    expect($known->json())->toBe($unknown->json());
});

it('lets a logged-in client set a first password without a current password', function (): void {
    $user = User::factory()->create(['password' => null]);

    $this->actingAs($user)
        ->putJson('/user/password', [
            'password' => 'nouveau-mot-de-passe',
            'password_confirmation' => 'nouveau-mot-de-passe',
        ])
        ->assertOk();

    expect(Hash::check('nouveau-mot-de-passe', $user->fresh()->password))->toBeTrue();
});

it('requires the current password to change an existing one', function (): void {
    $user = User::factory()->create(['password' => 'ancien-mot-de-passe']);

    $this->actingAs($user)
        ->putJson('/user/password', [
            'password' => 'nouveau-mot-de-passe',
            'password_confirmation' => 'nouveau-mot-de-passe',
        ])
        ->assertStatus(422);

    $this->actingAs($user)
        ->putJson('/user/password', [
            'current_password' => 'ancien-mot-de-passe',
            'password' => 'nouveau-mot-de-passe',
            'password_confirmation' => 'nouveau-mot-de-passe',
        ])
        ->assertOk();

    expect(Hash::check('nouveau-mot-de-passe', $user->fresh()->password))->toBeTrue();
});

it('properly invalidates the session on logout', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->getJson('/v1/account')->assertOk();

    $this->actingAs($user)->postJson('/logout')->assertNoContent();

    $this->assertGuest();
});
