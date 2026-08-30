<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Accounts\Http\Requests\StoreAddressRequest;
use App\Modules\Accounts\Http\Resources\AddressResource;
use App\Modules\Accounts\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $client = $request->user()?->client;
        abort_unless($client !== null, 403);

        $this->authorize('viewAny', Address::class);

        return AddressResource::collection($client->addresses()->latest('id')->get())->response();
    }

    public function store(StoreAddressRequest $request): JsonResponse
    {
        $client = $request->user()?->client;
        abort_unless($client !== null, 403);

        $this->authorize('create', Address::class);

        $address = $client->addresses()->create($request->validated());

        return (new AddressResource($address))->response()->setStatusCode(201);
    }

    public function show(Request $request, Address $address): JsonResponse
    {
        abort_unless(
            $request->user()?->administrator()
                || $request->user()?->client?->id === $address->client_id,
            404,
        );
        $this->authorize('view', $address);

        return (new AddressResource($address))->response();
    }

    public function update(StoreAddressRequest $request, Address $address): JsonResponse
    {
        abort_unless(
            $request->user()?->administrator()
                || $request->user()?->client?->id === $address->client_id,
            404,
        );
        $this->authorize('update', $address);

        $address->forceFill($request->validated())->save();

        return (new AddressResource($address))->response();
    }

    public function destroy(Request $request, Address $address): Response
    {
        abort_unless(
            $request->user()?->administrator()
                || $request->user()?->client?->id === $address->client_id,
            404,
        );
        $this->authorize('delete', $address);

        $address->delete();

        return response()->noContent();
    }
}
