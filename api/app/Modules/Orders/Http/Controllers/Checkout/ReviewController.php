<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Http\Controllers\Concerns\HasCheckoutDraft;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use HasCheckoutDraft;

    public function show(Request $request): JsonResponse
    {
        $order = $this->draft($request);

        if ($order->step() !== 'review') {
            return response()->json(['message' => 'Checkout is incomplete.'], 422);
        }

        return $this->payload($request);
    }
}
