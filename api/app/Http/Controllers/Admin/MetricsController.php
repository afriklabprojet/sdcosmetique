<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Catalog\Models\Product;
use App\Modules\Loyalty\Models\Account;
use App\Modules\Loyalty\Models\Entry;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment;
use App\Modules\Payments\Models\Payment\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class MetricsController extends Controller
{
    public function overview(): JsonResponse
    {
        $paid = Order::query()->whereNotNull('paid_at');

        $ordersPerDay = collect(range(6, 0))->map(function (int $daysAgo): array {
            $day = Carbon::today()->subDays($daysAgo);

            return [
                'date' => $day->toDateString(),
                'count' => Order::query()
                    ->whereNotNull('placed_at')
                    ->whereDate('placed_at', $day)
                    ->count(),
            ];
        })->values();

        $lowStock = Product::query()
            ->whereNotNull('parent_id')
            ->where('stock', '<', 5)
            ->with('parent:id,title')
            ->orderBy('stock')
            ->limit(20)
            ->get()
            ->map(fn (Product $product): array => [
                'id' => $product->id,
                'title' => $product->title,
                'sku' => $product->sku,
                'stock' => (int) $product->stock,
                'product' => $product->parent?->title,
            ])->values();

        return response()->json([
            'revenue' => [
                'today' => (int) (clone $paid)->whereDate('paid_at', today())->sum('total'),
                'last_7_days' => (int) (clone $paid)->where('paid_at', '>=', now()->subDays(7))->sum('total'),
                'last_30_days' => (int) (clone $paid)->where('paid_at', '>=', now()->subDays(30))->sum('total'),
                'currency' => 'XOF',
            ],
            'orders_per_day' => $ordersPerDay,
            'low_stock' => $lowStock,
            'pending_payments' => Payment::query()
                ->whereNull('paid_at')
                ->whereNull('failed_at')
                ->count(),
            'unhandled_notifications' => Notification::query()
                ->whereNull('handled_at')
                ->count(),
            'loyalty' => [
                'members' => Account::query()->count(),
                'points_issued' => (int) Entry::query()->where('points_delta', '>', 0)->sum('points_delta'),
            ],
        ]);
    }
}
