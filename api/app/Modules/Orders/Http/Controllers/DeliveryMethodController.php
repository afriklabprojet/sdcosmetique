<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Models\Delivery\Method;
use Illuminate\Http\JsonResponse;

class DeliveryMethodController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $methods = Method::query()
            ->whereNotNull('visible_at')
            ->where('visible_at', '<=', now())
            ->orderBy('position')
            ->get();

        return response()->json([
            'data' => $methods->map(fn (Method $method): array => [
                'id' => $method->id,
                'slug' => $method->slug,
                'name' => $method->name,
                'zone' => $method->zone,
                'amount' => $method->amount->value,
            ])->values(),
        ]);
    }
}
