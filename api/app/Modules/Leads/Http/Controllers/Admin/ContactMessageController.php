<?php

declare(strict_types=1);

namespace App\Modules\Leads\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Leads\Http\Resources\Admin\ContactMessageResource;
use App\Modules\Leads\Models\Contact\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Message::class);

        $messages = Message::query()
            ->when($request->string('status')->value() === 'open', fn ($q) => $q->whereNull('handled_at'))
            ->when($request->string('status')->value() === 'handled', fn ($q) => $q->whereNotNull('handled_at'))
            ->latest()
            ->paginate(30);

        return ContactMessageResource::collection($messages)->response();
    }

    public function show(Message $contactMessage): JsonResponse
    {
        $this->authorize('view', $contactMessage);

        return ContactMessageResource::make($contactMessage)->response();
    }

    public function update(Request $request, Message $contactMessage): JsonResponse
    {
        $this->authorize('update', $contactMessage);

        $handled = $request->boolean('handled', true);

        if ($handled) {
            $contactMessage->resolve();
        } else {
            $contactMessage->forceFill(['handled_at' => null])->save();
        }

        return ContactMessageResource::make($contactMessage->refresh())->response();
    }
}
