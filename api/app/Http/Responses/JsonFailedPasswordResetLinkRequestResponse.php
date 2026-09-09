<?php

declare(strict_types=1);

namespace App\Http\Responses;

use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\FailedPasswordResetLinkRequestResponse as FailedPasswordResetLinkRequestResponseContract;
use Symfony\Component\HttpFoundation\Response;

/**
 * Le comportement par défaut de Fortify renvoie une 422 distincte quand
 * l'email n'existe pas ("We can't find a user with that email address"),
 * ce qui transforme /forgot-password en oracle d'énumération de comptes.
 * On renvoie ici la même réponse générique que pour un envoi réussi dans ce
 * cas précis — les autres échecs (ex. throttling) restent signalés tels quels.
 */
final class JsonFailedPasswordResetLinkRequestResponse implements FailedPasswordResetLinkRequestResponseContract
{
    public function __construct(private readonly string $status) {}

    public function toResponse($request): Response
    {
        if ($this->status === Password::INVALID_USER) {
            return response()->json(['message' => trans('passwords.sent')]);
        }

        throw ValidationException::withMessages(['email' => [trans($this->status)]]);
    }
}
