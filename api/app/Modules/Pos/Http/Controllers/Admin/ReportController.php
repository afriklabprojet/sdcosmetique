<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment\Attempt;
use App\Modules\Pos\Enums\PosTenderMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

/** Dashboard caisse (§34) — chiffres du jour, calculés à la volée sur les ventes déjà en base (pas de table agrégée à maintenir). */
class ReportController extends Controller
{
    public function daily(): JsonResponse
    {
        $today = Order::query()
            ->where('channel', 'pos')
            ->whereNotNull('paid_at')
            ->whereDate('paid_at', Carbon::today());

        $count = (clone $today)->count();
        $revenue = (int) (clone $today)->sum('total');

        return response()->json([
            'data' => [
                'revenue' => $revenue,
                'sales_count' => $count,
                'average_ticket' => $count > 0 ? intdiv($revenue, $count) : 0,
                'by_hour' => $this->byHour(),
                'by_payment_method' => $this->byPaymentMethod(),
                'refunds_today' => Order::query()
                    ->where('channel', 'pos')
                    ->whereDate('refunded_at', Carbon::today())
                    ->count(),
            ],
        ]);
    }

    /** Widgets « Ventes Aujourd'hui / Cette semaine / Ce mois / Total cumulé » de l'historique caisse (§20). */
    public function summary(): JsonResponse
    {
        return response()->json(['data' => [
            'today' => $this->totalsSince(Carbon::today()),
            'week' => $this->totalsSince(Carbon::today()->startOfWeek()),
            'month' => $this->totalsSince(Carbon::today()->startOfMonth()),
            'all_time' => $this->totalsSince(null),
        ]]);
    }

    /**
     * @return array{revenue: int, sales_count: int}
     */
    private function totalsSince(?Carbon $since): array
    {
        $query = Order::query()->where('channel', 'pos')->whereNotNull('paid_at');

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
    private function byHour(): array
    {
        $orders = Order::query()
            ->where('channel', 'pos')
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
    private function byPaymentMethod(): array
    {
        $rows = Attempt::query()
            ->selectRaw('payment_attempts.gateway, sum(payment_attempts.amount) as total')
            ->whereNotNull('confirmed_at')
            ->whereDate('confirmed_at', Carbon::today())
            ->where('gateway', 'like', 'pos_%')
            ->groupBy('payment_attempts.gateway')
            ->pluck('total', 'gateway');

        $totals = [];

        foreach (PosTenderMethod::cases() as $method) {
            $totals[$method->value] = (int) ($rows[$method->gateway()] ?? 0);
        }

        return $totals;
    }
}
