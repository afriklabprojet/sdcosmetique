<?php

declare(strict_types=1);

namespace App\Modules\Leads\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Leads\Http\Resources\Admin\NewsletterSubscriptionResource;
use App\Modules\Leads\Models\Newsletter\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class NewsletterSubscriptionController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Subscription::class);

        $subscriptions = Subscription::query()->latest()->paginate(50);

        return NewsletterSubscriptionResource::collection($subscriptions)->response();
    }

    public function destroy(Subscription $newsletterSubscription): Response
    {
        $this->authorize('delete', $newsletterSubscription);

        $newsletterSubscription->delete();

        return response()->noContent();
    }
}
