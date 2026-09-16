<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Models\Order;
use App\Shared\Receipt\ReceiptData;
use App\Shared\Receipt\ReceiptPdfBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** Reçu premium d'une vente caisse (§19/§22) — remplace le renvoi vers la facture e-commerce générique, même moteur que le reçu public. */
class SaleReceiptController extends Controller
{
    public function __construct(private readonly ReceiptPdfBuilder $builder) {}

    public function show(Order $order): JsonResponse
    {
        abort_unless($order->pos(), 404);

        return response()->json(['data' => ReceiptData::build($order)]);
    }

    public function pdf(Request $request, Order $order): Response
    {
        abort_unless($order->pos(), 404);

        $format = (string) $request->string('format', 'thermal80');

        return $this->builder->render($order, $format)->stream('Recu-'.$order->reference.'.pdf');
    }
}
