<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain;

use App\Models\User;
use App\Modules\Identity\Models\LoginOtp;
use DomainException;
use Illuminate\Support\Facades\Hash;

/**
 * Codes de connexion à usage unique (6 chiffres, 10 minutes). Le code n'est
 * jamais loggé ni stocké en clair — seul son hash l'est, comme un mot de
 * passe. Un nouveau code invalide automatiquement tout code non utilisé du
 * même utilisateur.
 */
class OtpBroker
{
    private const int LENGTH_MIN = 100000;

    private const int LENGTH_MAX = 999999;

    private const int TTL_MINUTES = 10;

    private const int RESEND_COOLDOWN_SECONDS = 45;

    /**
     * @throws DomainException si un code vient déjà d'être envoyé
     */
    public function issue(User $user): string
    {
        $recent = LoginOtp::query()
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->latest('id')
            ->first();

        if ($recent !== null && $recent->created_at->diffInSeconds(now()) < self::RESEND_COOLDOWN_SECONDS) {
            throw new DomainException('Veuillez patienter avant de demander un nouveau code.');
        }

        // Un nouveau code invalide tout code précédent non utilisé.
        LoginOtp::query()
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $code = (string) random_int(self::LENGTH_MIN, self::LENGTH_MAX);

        LoginOtp::query()->create([
            'user_id' => $user->id,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::TTL_MINUTES),
        ]);

        return $code;
    }

    public function verify(User $user, string $code): bool
    {
        $candidates = LoginOtp::query()
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest('id')
            ->get();

        $match = $candidates->first(fn (LoginOtp $otp): bool => Hash::check($code, $otp->code_hash));

        if ($match === null) {
            return false;
        }

        $match->consume();

        return true;
    }
}
