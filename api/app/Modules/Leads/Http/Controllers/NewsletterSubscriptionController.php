<?php

declare(strict_types=1);

namespace App\Modules\Leads\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Leads\Http\Requests\StoreNewsletterSubscriptionRequest;
use App\Modules\Leads\Models\Newsletter\Subscription;
use Illuminate\Http\JsonResponse;

class NewsletterSubscriptionController extends Controller
{
    public function store(StoreNewsletterSubscriptionRequest $request): JsonResponse
    {
        $subscription = Subscription::query()->updateOrCreate(
            ['email' => $request->string('email')->toString()],
            [
                'confirmed_at' => now(),
                'unsubscribed_at' => null,
            ],
        );

        return response()->json([
            'data' => [
                'email' => $subscription->email,
                'confirmed_at' => $subscription->confirmed_at,
            ],
        ], $subscription->wasRecentlyCreated ? 201 : 200);
    }
}
