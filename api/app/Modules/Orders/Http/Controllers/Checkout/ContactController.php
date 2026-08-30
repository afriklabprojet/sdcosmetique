<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Http\Controllers\Concerns\HasCheckoutDraft;
use App\Modules\Orders\Http\Requests\UpdateContactRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    use HasCheckoutDraft;

    public function show(Request $request): JsonResponse
    {
        return $this->payload($request);
    }

    public function update(UpdateContactRequest $request): JsonResponse
    {
        $order = $this->draft($request);
        $order->forceFill(['email' => $request->string('email')->toString()])->save();

        return $this->payload($request);
    }
}
