<?php

declare(strict_types=1);

namespace App\Modules\Identity\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Étape 1 de la connexion : l'e-mail seul détermine s'il faut proposer
 * "mot de passe" et/ou "code par e-mail" ensuite (§5-7 du parcours). Cette
 * étape révèle volontairement si le compte existe — c'est le comportement
 * demandé, différent du cas mot-de-passe-oublié où on ne le fait jamais.
 */
class LoginCheckController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'string', 'email', 'max:255']]);

        $email = Str::lower(trim((string) $request->string('email')));
        $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();

        return response()->json([
            'exists' => $user !== null,
            'has_password' => $user !== null && $user->password !== null,
        ]);
    }
}
