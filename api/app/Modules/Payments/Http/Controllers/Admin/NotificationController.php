<?php

declare(strict_types=1);

namespace App\Modules\Payments\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Payments\Http\Resources\Admin\NotificationResource;
use App\Modules\Payments\Models\Payment\Notification;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Notification::class);

        $notifications = Notification::query()->latest()->paginate(50);

        return NotificationResource::collection($notifications)->response();
    }

    public function show(Notification $paymentNotification): JsonResponse
    {
        $this->authorize('view', $paymentNotification);

        return NotificationResource::make($paymentNotification)->response();
    }
}
