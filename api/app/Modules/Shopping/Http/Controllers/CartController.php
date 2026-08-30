<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends ShoppingController
{
    public function show(Request $request): JsonResponse
    {
        return $this->cartPayload($request, $this->cart($request));
    }
}
