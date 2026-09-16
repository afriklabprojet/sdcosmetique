<?php

declare(strict_types=1);

namespace App\Modules\Pos\Queries;

use App\Modules\Orders\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/** Filtres de l'historique caisse (§20) — partagés entre l'index paginé et les exports PDF/CSV. */
final class PosSaleIndex
{
    /**
     * @return Builder<Order>
     */
    public function filtered(Request $request): Builder
    {
        $query = Order::query()->where('channel', 'pos')->whereNotNull('placed_at');

        if ($request->filled('served_by')) {
            $query->where('served_by', $request->integer('served_by'));
        }

        if ($request->filled('cash_register_session_id')) {
            $query->where('cash_register_session_id', $request->integer('cash_register_session_id'));
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->integer('client_id'));
        }

        if ($request->filled('reference')) {
            $query->where('reference', 'like', '%'.$request->string('reference').'%');
        }

        if ($request->filled('status')) {
            match ($request->string('status')->toString()) {
                'refunded' => $query->whereNotNull('refunded_at'),
                'paid' => $query->whereNotNull('paid_at')->whereNull('refunded_at'),
                default => null,
            };
        }

        if ($request->filled('from')) {
            $query->whereDate('placed_at', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('placed_at', '<=', $request->date('to'));
        }

        return $query->latest('placed_at');
    }
}
