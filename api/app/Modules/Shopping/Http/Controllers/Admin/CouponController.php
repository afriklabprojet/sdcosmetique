<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Shopping\Http\Requests\Admin\CouponRequest;
use App\Modules\Shopping\Http\Resources\Admin\CouponResource;
use App\Modules\Shopping\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class CouponController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Coupon::class);

        $coupons = Coupon::query()->withCount('redemptions')->latest()->paginate(50);

        return CouponResource::collection($coupons)->response();
    }

    public function store(CouponRequest $request): JsonResponse
    {
        $this->authorize('create', Coupon::class);

        $coupon = Coupon::create($request->validated());

        return CouponResource::make($coupon)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Coupon $coupon): JsonResponse
    {
        $this->authorize('view', $coupon);

        return CouponResource::make($coupon->loadCount('redemptions'))->response();
    }

    public function update(CouponRequest $request, Coupon $coupon): JsonResponse
    {
        $this->authorize('update', $coupon);

        $coupon->update($request->validated());

        return CouponResource::make($coupon->loadCount('redemptions'))->response();
    }

    public function destroy(Coupon $coupon): Response
    {
        $this->authorize('delete', $coupon);

        $coupon->delete();

        return response()->noContent();
    }
}
