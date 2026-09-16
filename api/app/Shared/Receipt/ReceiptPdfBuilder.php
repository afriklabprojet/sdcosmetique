<?php

declare(strict_types=1);

namespace App\Shared\Receipt;

use App\Modules\Orders\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as DomPdf;
use InvalidArgumentException;

/** Rendu PDF du reçu (§17/§18) — thermique 58/80mm ou A4, à partir du même JSON que l'aperçu web et l'API (§34), jamais d'une donnée recalculée séparément. */
final class ReceiptPdfBuilder
{
    /** Largeur en points (1mm = 2.8346pt) ; hauteur généreuse pour un ticket continu, dompdf pagine si un reçu déborde. */
    private const array PAPER = [
        'thermal58' => [164.4, 1200.0],
        'thermal80' => [226.8, 1200.0],
    ];

    public function render(Order $order, string $format = 'a4'): DomPdf
    {
        $data = ReceiptData::build($order);
        $data['format'] = $format;

        $pdf = Pdf::loadView('pdf.receipt', $data);

        if ($format === 'a4') {
            return $pdf->setPaper('a4', 'portrait');
        }

        $size = self::PAPER[$format] ?? throw new InvalidArgumentException("Format de reçu inconnu : {$format}.");

        return $pdf->setPaper([0, 0, $size[0], $size[1]], 'portrait');
    }
}
