<?php

declare(strict_types=1);

namespace App\Modules\Identity\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpLoginMail;
use App\Models\User;
use App\Modules\Identity\Domain\OtpBroker;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class OtpLoginController extends Controller
{
    public function __construct(private readonly OtpBroker $otp) {}

    /**
     * Toujours une réponse générique : ne révèle jamais si l'e-mail
     * correspond à un compte (contrairement à /login/check, volontairement
     * transparent à l'étape 1 — ici la demande de code est plus sensible).
     */
    public function request(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'string', 'email', 'max:255']]);

        $email = Str::lower(trim((string) $request->string('email')));
        $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();

        if ($user !== null) {
            try {
                $code = $this->otp->issue($user);
                Mail::to($user->email)->send(new OtpLoginMail($user, $code));
            } catch (DomainException $exception) {
                // Cooldown de renvoi — pas d'erreur générique, l'utilisateur doit patienter.
                return response()->json(['message' => $exception->getMessage()], 429);
            } catch (Throwable $exception) {
                Log::error('OtpLoginMail could not be sent.', ['user_id' => $user->id, 'error' => $exception->getMessage()]);
            }
        }

        return response()->json(['message' => 'Si un compte existe pour cette adresse, un code a été envoyé.']);
    }

    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $email = Str::lower(trim((string) $request->string('email')));
        $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();

        if ($user === null || ! $this->otp->verify($user, $request->string('code')->toString())) {
            return response()->json(['message' => 'Ce code est invalide ou a expiré.'], 422);
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json(['two_factor' => false]);
    }
}
