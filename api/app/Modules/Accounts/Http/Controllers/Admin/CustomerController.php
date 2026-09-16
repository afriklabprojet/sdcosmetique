<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Accounts\Http\Resources\Admin\CustomerDetailResource;
use App\Modules\Accounts\Http\Resources\Admin\CustomerResource;
use App\Modules\Accounts\Models\Client;
use App\Modules\Orders\Http\Resources\OrderResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Client::class);

        $term = trim((string) $request->string('q'));

        $clients = Client::query()
            ->with('user')
            ->withCount('orders')
            ->when($term !== '', function ($query) use ($term): void {
                // Recherche rapide (sélecteur client de la caisse, §7) — nom/e-mail
                // du compte ou téléphone du client, insensible à la casse.
                $query->where(function ($builder) use ($term): void {
                    $builder->whereHas('user', function ($userQuery) use ($term): void {
                        $userQuery->where('name', 'like', "%{$term}%")
                            ->orWhere('email', 'like', "%{$term}%");
                    })->orWhere('phone', 'like', "%{$term}%");
                });
            })
            ->latest()
            ->paginate(perPage: min((int) $request->integer('perPage', 20), 100));

        return CustomerResource::collection($clients)->response();
    }

    /** Fiche client complète (§4) — infos, adresse, statistiques. */
    public function show(Client $client): JsonResponse
    {
        $this->authorize('view', $client);

        $client->load('user');

        return CustomerDetailResource::make($client)->response();
    }

    /** Historique des commandes de la fiche client (§4), paginé, plus récentes d'abord. */
    public function orders(Request $request, Client $client): JsonResponse
    {
        $this->authorize('view', $client);

        $orders = $client->orders()
            ->whereNotNull('placed_at')
            ->latest('placed_at')
            ->paginate(perPage: min((int) $request->integer('perPage', 20), 50));

        return OrderResource::collection($orders)->response();
    }
}
