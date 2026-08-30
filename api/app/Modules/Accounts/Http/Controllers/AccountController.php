<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Accounts\Http\Requests\UpdateAccountRequest;
use App\Modules\Accounts\Http\Resources\AccountResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        abort_unless($request->user() !== null, 401);

        return (new AccountResource($request->user()->load('client')))->response()->setStatusCode(200);
    }

    public function update(UpdateAccountRequest $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $user->forceFill($request->only(['name']))->save();

        $client = $user->client ?? $user->client()->create([]);
        $client->forceFill($request->only(['phone']))->save();

        return (new AccountResource($user->fresh('client')))->response()->setStatusCode(200);
    }
}
