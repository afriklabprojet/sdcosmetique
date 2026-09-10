<?php

declare(strict_types=1);

namespace App\Modules\Invoicing\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendOrderInvoiceEmailJob;
use App\Modules\Invoicing\Domain\InvoicePdfBuilder;
use App\Modules\Invoicing\Models\Invoice;
use App\Modules\Orders\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class InvoiceController extends Controller
{
    public function __construct(private readonly InvoicePdfBuilder $builder) {}

    /** Numéro de facture + statut d'envoi courant — pour l'affichage dans le panneau admin, sans déclencher de rendu PDF ni d'envoi. */
    public function status(Order $order): JsonResponse
    {
        $this->authorize('update', $order);

        $invoice = Invoice::forOrder($order);

        return response()->json(['data' => [
            'number' => $invoice->number,
            'email_status' => $invoice->email_status,
            'email_sent_at' => $invoice->email_sent_at?->toIso8601String(),
            'email_error' => $invoice->email_error,
        ]]);
    }

    /**
     * Aperçu depuis la page de réglages « Détails de la facture » — rendu
     * avec la commande réelle la plus récente (jamais de données fictives) ;
     * l'admin doit d'abord enregistrer ses réglages pour les voir reflétés.
     */
    public function preview(): Response
    {
        $order = Order::query()->whereNotNull('placed_at')->latest('placed_at')->first()
            ?? Order::query()->latest()->first();

        if ($order === null) {
            abort(404, 'Aucune commande disponible pour générer un aperçu.');
        }

        return $this->builder->render($order)->stream('Facture-SD-COSMETIQUE-apercu.pdf');
    }

    /** Prévisualisation dans le navigateur — sert aussi de vue "Imprimer" (le lecteur PDF du navigateur gère l'impression). */
    public function show(Order $order): Response
    {
        $this->authorize('update', $order);

        $invoice = Invoice::forOrder($order);

        return $this->builder->render($order)->stream('Facture-SD-COSMETIQUE-'.$invoice->number.'.pdf');
    }

    public function download(Order $order): Response
    {
        $this->authorize('update', $order);

        $invoice = Invoice::forOrder($order);

        return $this->builder->render($order)->download('Facture-SD-COSMETIQUE-'.$invoice->number.'.pdf');
    }

    public function send(Order $order): JsonResponse
    {
        $this->authorize('update', $order);

        $invoice = Invoice::forOrder($order);
        $invoice->forceFill(['email_status' => Invoice::STATUS_PENDING])->save();

        SendOrderInvoiceEmailJob::dispatch($order->id);

        return response()->json(['data' => ['email_status' => Invoice::STATUS_PENDING]]);
    }
}
