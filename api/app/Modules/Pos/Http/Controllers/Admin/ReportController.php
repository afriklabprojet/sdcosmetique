<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Identity\Enums\AdminRole;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment\Attempt;
use App\Modules\Pos\Enums\PosTenderMethod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/** Dashboard caisse (§34) — chiffres du jour, calculés à la volée sur les ventes déjà en base (pas de table agrégée à maintenir). */
class ReportController extends Controller
{
    public function daily(Request $request): JsonResponse
    {
        $cashierId = $this->cashierId($request);
        $today = $this->orders($cashierId)
            ->whereNotNull('paid_at')
            ->whereDate('paid_at', Carbon::today());

        $count = (clone $today)->count();
        $revenue = (int) (clone $today)->sum('total');

        return response()->json([
            'data' => [
                'revenue' => $revenue,
                'sales_count' => $count,
                'average_ticket' => $count > 0 ? intdiv($revenue, $count) : 0,
                'by_hour' => $this->byHour($cashierId),
                'by_payment_method' => $this->byPaymentMethod($cashierId),
                'refunds_today' => $this->orders($cashierId)
                    ->whereDate('refunded_at', Carbon::today())
                    ->count(),
            ],
        ]);
    }

    /** Widgets « Ventes Aujourd'hui / Cette semaine / Ce mois / Total cumulé » de l'historique caisse (§20). */
    public function summary(Request $request): JsonResponse
    {
        $cashierId = $this->cashierId($request);

        return response()->json(['data' => [
            'today' => $this->totalsSince(Carbon::today(), $cashierId),
            'week' => $this->totalsSince(Carbon::today()->startOfWeek(), $cashierId),
            'month' => $this->totalsSince(Carbon::today()->startOfMonth(), $cashierId),
            'all_time' => $this->totalsSince(null, $cashierId),
        ]]);
    }

    /**
     * @return array{revenue: int, sales_count: int}
     */
    private function totalsSince(?Carbon $since, ?int $cashierId): array
    {
        $query = $this->orders($cashierId)->whereNotNull('paid_at');

        if ($since !== null) {
            $query->where('paid_at', '>=', $since);
        }

        return [
            'revenue' => (int) (clone $query)->sum('total'),
            'sales_count' => (clone $query)->count(),
        ];
    }

    /**
     * @return array<int, array{hour: int, count: int}>
     */
    private function byHour(?int $cashierId): array
    {
        $orders = $this->orders($cashierId)
            ->whereNotNull('paid_at')
            ->whereDate('paid_at', Carbon::today())
            ->pluck('paid_at');

        $counts = array_fill(0, 24, 0);

        foreach ($orders as $paidAt) {
            $counts[(int) $paidAt->format('G')]++;
        }

        return collect($counts)->map(fn (int $count, int $hour): array => [
            'hour' => $hour,
            'count' => $count,
        ])->values()->all();
    }

    /**
     * @return array<string, int>
     */
    private function byPaymentMethod(?int $cashierId): array
    {
        $query = Attempt::query()
            ->selectRaw('payment_attempts.gateway, sum(payment_attempts.amount) as total')
            ->whereNotNull('confirmed_at')
            ->whereDate('confirmed_at', Carbon::today())
            ->where('gateway', 'like', 'pos_%');

        if ($cashierId !== null) {
            $query->whereIn('payment_id', function ($payments) use ($cashierId): void {
                $payments->select('payments.id')
                    ->from('payments')
                    ->join('orders', 'orders.id', '=', 'payments.order_id')
                    ->where('orders.served_by', $cashierId);
            });
        }

        $rows = $query
            ->groupBy('payment_attempts.gateway')
            ->pluck('total', 'gateway');

        $totals = [];

        foreach (PosTenderMethod::cases() as $method) {
            $totals[$method->value] = (int) ($rows[$method->gateway()] ?? 0);
        }

        return $totals;
    }

    /** @return Builder<Order> */
    private function orders(?int $cashierId): Builder
    {
        return Order::query()
            ->where('channel', 'pos')
            ->when($cashierId !== null, fn (Builder $query): Builder => $query->where('served_by', $cashierId));
    }

    private function cashierId(Request $request): ?int
    {
        $admin = $request->user()?->admin;
        abort_unless($admin !== null, 403);

        return $admin->tier() === AdminRole::Cashier ? $admin->id : null;
    }
}
