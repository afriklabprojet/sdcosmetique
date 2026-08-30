<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Http\Requests\Admin\DeliveryMethodRequest;
use App\Modules\Orders\Http\Resources\Admin\DeliveryMethodResource;
use App\Modules\Orders\Models\Delivery\Method;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class DeliveryMethodController extends Controller
{
    public function index(): JsonResponse
    {
        $methods = Method::query()->orderBy('position')->get();

        return DeliveryMethodResource::collection($methods)->response();
    }

    public function store(DeliveryMethodRequest $request): JsonResponse
    {
        $method = Method::create($request->validated());

        return DeliveryMethodResource::make($method)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Method $deliveryMethod): JsonResponse
    {
        return DeliveryMethodResource::make($deliveryMethod)->response();
    }

    public function update(DeliveryMethodRequest $request, Method $deliveryMethod): JsonResponse
    {
        $deliveryMethod->update($request->validated());

        return DeliveryMethodResource::make($deliveryMethod)->response();
    }

    public function destroy(Method $deliveryMethod): Response
    {
        $deliveryMethod->delete();

        return response()->noContent();
    }
}
