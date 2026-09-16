<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Pos\Domain\PosSaleExport;
use App\Modules\Pos\Queries\PosSaleIndex;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Export CSV (ouvrable dans Excel) de l'historique caisse (§20), mêmes filtres que la liste et l'export PDF. */
class SaleCsvExportController extends Controller
{
    public function __construct(
        private readonly PosSaleIndex $salesIndex,
        private readonly PosSaleExport $export,
    ) {}

    public function index(Request $request): StreamedResponse
    {
        $orders = $this->salesIndex->filtered($request)->limit(1000)->get();
        $rows = $this->export->rows($orders);

        $filename = 'Historique-caisse-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($rows): void {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\u{FEFF}"); // BOM — Excel détecte l'UTF-8 sans ça les accents s'affichent mal.
            fputcsv($handle, ['Référence', 'Date', 'Client', 'Vendeur', 'Total (XOF)', 'Statut'], ';');

            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row['reference'],
                    $row['placed_at']?->format('d/m/Y H:i') ?? '',
                    $row['customer'],
                    $row['cashier'],
                    $row['total'],
                    $row['status'],
                ], ';');
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
