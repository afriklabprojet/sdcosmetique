<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Invoicing\Domain\InvoicePdfBuilder;
use App\Modules\Pos\Domain\PosSaleExport;
use App\Modules\Pos\Queries\PosSaleIndex;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** Export PDF de l'historique caisse (§20), respectant les mêmes filtres que la liste affichée à l'écran. */
class SalePdfExportController extends Controller
{
    public function __construct(
        private readonly PosSaleIndex $salesIndex,
        private readonly PosSaleExport $export,
    ) {}

    public function index(Request $request): Response
    {
        $orders = $this->salesIndex->filtered($request)->limit(1000)->get();
        $rows = $this->export->rows($orders);

        $pdf = Pdf::loadView('pdf.pos-sales', [
            'rows' => $rows,
            'total' => array_sum(array_column($rows, 'total')),
            'money' => static fn (int $amount): string => InvoicePdfBuilder::formatMoney($amount),
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('Historique-caisse-'.now()->format('Y-m-d').'.pdf');
    }
}
