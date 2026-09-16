<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Models\Order;
use App\Shared\Receipt\ReceiptData;
use App\Shared\Receipt\ReceiptPdfBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

/**
 * Reçu public d'une commande (§14/§22) — protégé par une URL signée Laravel
 * (middleware `signed`, voir routes/api/orders.php), pas par l'e-mail du
 * client : une vente caisse lie quasi systématiquement un compte dès qu'un
 * e-mail est saisi (`ClientLinker`), ce qui rendrait le second facteur
 * « référence + e-mail » de `OrderPolicy` inutilisable pour la plupart des
 * ventes. La signature ne dépend d'aucune donnée personnelle du client.
 */
class ReceiptController extends Controller
{
    public function __construct(private readonly ReceiptPdfBuilder $builder) {}

    public function show(Order $order): JsonResponse
    {
        return response()->json(['data' => ReceiptData::build($order)]);
    }

    public function pdf(Order $order): Response
    {
        return $this->builder->render($order, 'a4')->stream('Recu-'.$order->reference.'.pdf');
    }
}
