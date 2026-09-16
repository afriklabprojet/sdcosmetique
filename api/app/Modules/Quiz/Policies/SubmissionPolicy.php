<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Policies;

use App\Models\User;
use App\Modules\Quiz\Models\Submission;

class SubmissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->administrator();
    }

    /**
     * Une soumission contient des données personnelles (e-mail, téléphone,
     * réponses) — jamais consultable anonymement. Seul l'admin ou le client
     * propriétaire (quand un compte a été lié) peut la lire. Aucun parcours
     * public actuel n'appelle cette route : le résultat du quiz est déjà
     * renvoyé directement par `store()`.
     */
    public function view(?User $user, Submission $submission): bool
    {
        if ($user?->administrator()) {
            return true;
        }

        return $user?->client?->id !== null && $user->client->id === $submission->client_id;
    }

    public function create(?User $user): bool
    {
        return true;
    }
}
