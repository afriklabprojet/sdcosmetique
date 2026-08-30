<?php

declare(strict_types=1);

namespace App\Modules\Leads\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Leads\Http\Requests\StoreContactMessageRequest;
use App\Modules\Leads\Models\Contact\Message;
use Illuminate\Http\JsonResponse;

class ContactMessageController extends Controller
{
    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        $message = Message::query()->create($request->validated());

        return response()->json([
            'data' => [
                'id' => $message->id,
            ],
        ], 201);
    }
}
