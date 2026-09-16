<?php
/**
 * @var list<array{reference: string, placed_at: mixed, customer: string, cashier: string, total: int, status: string}> $rows
 * @var int $total
 * @var \Closure(int): string $money
 * @var \Illuminate\Support\Carbon $generatedAt
 */
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Historique des ventes caisse</title>
<style>
  @page { margin: 26px 28px 40px 28px; }
  * { box-sizing: border-box; }
  body { font-family: 'DejaVu Sans', Arial, Helvetica, sans-serif; font-size: 10px; color: #1A0E05; margin: 0; }
  table { border-collapse: collapse; width: 100%; }
  h1 { font-size: 16px; margin: 0 0 4px; }
  .muted { color: #6B5B4D; font-size: 9.5px; margin: 0 0 16px; }
  .items th { background: #F4EBE1; color: #6B3D14; font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em; padding: 7px 8px; text-align: left; border-bottom: 1px solid #E5D9C8; }
  .items td { padding: 6px 8px; border-bottom: 1px solid #F0EBE0; }
  .items tr { page-break-inside: avoid; }
  .right { text-align: right; }
  .totals { margin-top: 12px; text-align: right; font-size: 12px; font-weight: 700; }
</style>
</head>
<body>
  <h1>Historique des ventes caisse</h1>
  <p class="muted">Généré le {{ $generatedAt->format('d/m/Y à H:i') }} — {{ count($rows) }} vente(s)</p>

  <table class="items">
    <thead>
      <tr>
        <th>N°</th>
        <th>Date</th>
        <th>Client</th>
        <th>Vendeur</th>
        <th class="right">Total</th>
        <th>Statut</th>
      </tr>
    </thead>
    <tbody>
      @forelse ($rows as $row)
        <tr>
          <td>{{ $row['reference'] }}</td>
          <td>{{ $row['placed_at']?->format('d/m/Y H:i') }}</td>
          <td>{{ $row['customer'] }}</td>
          <td>{{ $row['cashier'] }}</td>
          <td class="right">{{ $money($row['total']) }}</td>
          <td>{{ $row['status'] }}</td>
        </tr>
      @empty
        <tr><td colspan="6">Aucune vente.</td></tr>
      @endforelse
    </tbody>
  </table>

  <div class="totals">Total : {{ $money($total) }}</div>
</body>
</html>
