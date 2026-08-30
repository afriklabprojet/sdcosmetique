<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Accounts\Http\Resources\Admin\CustomerResource;
use App\Modules\Accounts\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $clients = Client::query()
            ->with('user')
            ->withCount('orders')
            ->latest()
            ->paginate(perPage: min((int) $request->integer('perPage', 20), 100));

        return CustomerResource::collection($clients)->response();
    }

    public function show(Client $client): JsonResponse
    {
        $client->load('user')->loadCount('orders');

        return CustomerResource::make($client)->response();
    }
}
