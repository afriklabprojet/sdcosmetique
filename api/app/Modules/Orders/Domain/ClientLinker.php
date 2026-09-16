<?php

declare(strict_types=1);

namespace App\Modules\Orders\Domain;

use App\Mail\AccountReadyMail;
use App\Models\User;
use App\Modules\Accounts\Models\Client;
use App\Modules\Orders\Models\Order;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

/**
 * Attache une commande payée au compte client correspondant à son e-mail —
 * en créant ce compte s'il n'existe pas encore. N'est appelé qu'après un
 * paiement confirmé (`Order::pay()`), jamais sur un panier abandonné ou un
 * paiement échoué : c'est `Notification::settle()` qui déclenche ceci, pas
 * la création de la commande elle-même.
 *
 * Un compte auto-créé n'a pas de mot de passe (colonne nullable) — la
 * connexion se fait par code e-mail jusqu'à ce que le client en définisse un.
 */
class ClientLinker
{
    public function __construct(private readonly Order $order) {}

    public function attach(): void
    {
        if ($this->order->client_id !== null) {
            // Déjà lié — commande passée par un client connecté, ou déjà traité.
            return;
        }

        $email = Str::lower(trim((string) $this->order->email));

        if ($email === '') {
            return;
        }

        $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();

        if ($user !== null) {
            $this->attachToExisting($user);

            return;
        }

        $this->createAndAttach($email);
    }

    private function attachToExisting(User $user): void
    {
        $client = $user->client;

        if ($client === null) {
            $client = $user->client()->create(['phone' => null]);
        }

        $destination = $this->destination();

        // Ne complète que les champs vides — ne jamais écraser une info déjà renseignée.
        if ($client->phone === null && ! empty($destination['phone'])) {
            $client->forceFill(['phone' => $destination['phone']])->save();
        }

        $this->order->forceFill(['client_id' => $client->id])->save();
    }

    private function createAndAttach(string $email): void
    {
        $destination = $this->destination();
        $name = trim(trim((string) ($destination['first_name'] ?? '')).' '.trim((string) ($destination['last_name'] ?? '')));

        $user = User::create([
            'name' => $name !== '' ? $name : $email,
            'email' => $email,
            'password' => null,
        ]);

        /** @var Client $client */
        $client = $user->client()->create(['phone' => $destination['phone'] ?? null]);

        // `addresses` a plusieurs colonnes obligatoires (last_name, line_1,
        // city, phone) — une destination web en a toujours autant, mais une
        // vente caisse (§7) ne renseigne parfois qu'un nom et un téléphone
        // pour un client de passage : ne créer l'adresse que si elle est
        // réellement complète, sinon le téléphone reste seulement sur le
        // client (déjà fait ci-dessus).
        if (! empty($destination['last_name']) && ! empty($destination['line_1']) && ! empty($destination['city']) && ! empty($destination['phone'])) {
            $client->addresses()->create($destination);
        }

        $this->order->forceFill(['client_id' => $client->id])->save();

        $this->sendWelcomeEmail($user);
    }

    /**
     * @return array<string, mixed>
     */
    private function destination(): array
    {
        return is_array($this->order->destination) ? $this->order->destination : [];
    }

    private function sendWelcomeEmail(User $user): void
    {
        try {
            Mail::to($user->email)->send(new AccountReadyMail($user));
        } catch (Throwable $exception) {
            // Un e-mail qui échoue ne doit jamais annuler une commande payée.
            Log::warning('AccountReadyMail could not be sent.', [
                'user_id' => $user->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
