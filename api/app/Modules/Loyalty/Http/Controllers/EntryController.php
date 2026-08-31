<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Loyalty\Enums\LoyaltyReason;
use App\Modules\Loyalty\Http\Requests\StoreRedemptionRequest;
use App\Modules\Loyalty\Http\Resources\EntryResource;
use App\Modules\Loyalty\Models\Account;
use App\Modules\Loyalty\Models\Entry;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class EntryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Entry::class);

        $client = $request->user()?->client;

        abort_if($client === null, 403);

        $account = Account::query()->where('client_id', $client->id)->first();

        $entries = $account === null
            ? collect()
            : $account->entries()->get();

        return EntryResource::collection($entries);
    }

    public function store(StoreRedemptionRequest $request): JsonResponse
    {
        $this->authorize('redeem', Entry::class);

        $client = $request->user()?->client;

        abort_if($client === null, 403);

        try {
            $entry = Account::for($client)->credit(
                $request->integer('points_delta'),
                LoyaltyReason::PointsRedemption,
                $request->string('description')->toString(),
                'reward',
                $request->input('reference_id'),
            );
        } catch (DomainException $e) {
            throw ValidationException::withMessages([
                'points_delta' => $e->getMessage(),
            ]);
        }

        return EntryResource::make($entry)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
