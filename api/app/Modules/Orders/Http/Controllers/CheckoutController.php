<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Http\Controllers\Concerns\HasCheckoutDraft;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    use HasCheckoutDraft;

    public function __invoke(Request $request): JsonResponse
    {
        $order = $this->draft($request);

        return response()->json([
            'data' => [
                'reference' => $order->reference,
                'step' => $order->step(),
                'email' => $order->email,
                'status' => $order->status()->value,
            ],
        ]);
    }
}
