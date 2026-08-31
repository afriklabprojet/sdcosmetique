<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Accounts\Models\Client;
use App\Modules\Loyalty\Enums\LoyaltyReason;
use App\Modules\Loyalty\Http\Requests\Admin\AdjustmentRequest;
use App\Modules\Loyalty\Http\Resources\Admin\EntryResource;
use App\Modules\Loyalty\Models\Account;
use App\Modules\Loyalty\Models\Entry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class AdjustmentController extends Controller
{
    public function store(AdjustmentRequest $request): JsonResponse
    {
        $this->authorize('create', Entry::class);

        $client = Client::query()->findOrFail($request->integer('client_id'));

        $entry = Account::for($client)->credit(
            $request->integer('points_delta'),
            LoyaltyReason::AdminAdjustment,
            $request->string('description')->toString(),
            'admin',
            (string) $request->user()?->id,
        );

        return EntryResource::make($entry->load('account'))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
