<?php

declare(strict_types=1);

namespace App\Modules\Payments\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Payments\Http\Resources\Admin\PaymentResource;
use App\Modules\Payments\Models\Payment;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Payment::class);

        $payments = Payment::query()->with('order')->latest()->paginate(50);

        return PaymentResource::collection($payments)->response();
    }

    public function show(Payment $payment): JsonResponse
    {
        $this->authorize('view', $payment);

        return PaymentResource::make($payment->load('order'))->response();
    }
}
