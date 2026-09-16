<?php
/**
 * @var string $sale_number
 * @var string $channel
 * @var ?string $date
 * @var ?string $time
 * @var array<string, mixed> $merchant
 * @var ?array{name: string} $cashier
 * @var ?array{name: string} $register
 * @var ?array{name: string, phone: ?string} $customer
 * @var list<array<string, mixed>> $items
 * @var int $subtotal
 * @var int $discount
 * @var int $tax
 * @var int $total
 * @var string $currency
 * @var list<array<string, mixed>> $payments
 * @var int $change
 * @var string $status
 * @var ?string $qr_image
 * @var ?string $receipt_url
 * @var string $format
 */
use App\Shared\Money;

$money = static fn (int $amount): string => (new Money($amount, $currency))->format();
$isA4 = $format === 'a4';

$statusLabel = match ($status) {
    'refunded' => 'REMBOURSÉ',
    'partial_refund' => 'PARTIELLEMENT REMBOURSÉ',
    'cancelled' => 'ANNULÉ',
    'pending' => 'EN ATTENTE',
    default => 'PAIEMENT CONFIRMÉ',
};
$statusColor = match ($status) {
    'refunded', 'cancelled' => '#B23B3B',
    'partial_refund', 'pending' => '#9A6B1E',
    default => '#3B7A4A',
};
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Reçu {{ $sale_number }}</title>
<style>
  @page { margin: {{ $isA4 ? '26px 28px 40px 28px' : '6px' }}; }
  * { box-sizing: border-box; }
  body {
    font-family: 'DejaVu Sans', Arial, Helvetica, sans-serif;
    color: #1A0E05;
    margin: 0;
    font-size: {{ $isA4 ? '10.5px' : '11px' }};
  }
  table { border-collapse: collapse; width: 100%; }
  .center { text-align: center; }
  .right { text-align: right; }
  .muted { color: #6B5B4D; }
  .logo { max-height: 48px; max-width: 160px; }
  .shop-name { font-size: {{ $isA4 ? '17px' : '14px' }}; font-weight: 700; margin: 6px 0 2px; }
  .divider { border-top: 1px dashed #C9B8A4; margin: 10px 0; }
  .divider-solid { border-top: 1px solid #E5D9C8; margin: 10px 0; }
  .section-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8F5922; margin: 0 0 6px; }
  .items th { font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.04em; color: #8F5922; text-align: left; padding: 6px 4px; border-bottom: 1px solid #E5D9C8; }
  .items td { padding: 5px 4px; font-size: {{ $isA4 ? '10px' : '10.5px' }}; vertical-align: top; }
  .item-variant { font-size: 8.5px; color: #6B5B4D; }
  .totals td { padding: 3px 0; font-size: {{ $isA4 ? '10.5px' : '11px' }}; }
  .totals .label { color: #6B5B4D; }
  .total-box { background: #8F5922; color: #fff; border-radius: 4px; padding: {{ $isA4 ? '14px 16px' : '10px 12px' }}; margin: 12px 0; text-align: center; }
  .total-box .label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #F4E8D8; margin: 0 0 4px; }
  .total-box .amount { font-size: {{ $isA4 ? '22px' : '18px' }}; font-weight: 700; }
  .status { display: inline-block; margin: 8px 0; padding: 5px 12px; border-radius: 999px; font-size: 9.5px; font-weight: 700; letter-spacing: 0.04em; color: #fff; background: {{ $statusColor }}; }
  .qr { text-align: center; margin: 14px 0; }
  .qr img { width: {{ $isA4 ? '96px' : '84px' }}; height: auto; }
  .footer { text-align: center; margin-top: 14px; color: #6B5B4D; font-size: {{ $isA4 ? '9.5px' : '9px' }}; line-height: 1.5; }
  .footer .thanks { font-size: {{ $isA4 ? '11px' : '10px' }}; font-weight: 600; color: #1A0E05; margin-bottom: 6px; }
</style>
</head>
<body>

  <div class="center">
    @if ($merchant['logo'])
      <img src="{{ $merchant['logo'] }}" class="logo" alt="">
    @endif
    <div class="shop-name">{{ $merchant['name'] }}</div>
    @if ($merchant['address'])
      <div class="muted">{{ $merchant['address'] }}</div>
    @endif
    @if ($merchant['phone'])
      <div class="muted">{{ $merchant['phone'] }}</div>
    @endif
    @if ($merchant['website'])
      <div class="muted">{{ $merchant['website'] }}</div>
    @endif
  </div>

  <div class="divider"></div>

  <div class="center">
    <div class="section-title">Reçu de vente</div>
    <div>N° {{ $sale_number }}</div>
    <div class="muted">{{ $date }} · {{ $time }}</div>
    @if ($cashier)
      <div class="muted">Vendeur : {{ $cashier['name'] }}</div>
    @endif
    @if ($register)
      <div class="muted">Caisse : {{ $register['name'] }}</div>
    @endif
  </div>

  <div class="divider"></div>

  <div class="section-title">Client</div>
  @if ($customer)
    <div>{{ $customer['name'] }}</div>
    @if ($customer['phone'])
      <div class="muted">{{ $customer['phone'] }}</div>
    @endif
  @else
    <div class="muted">Client comptoir</div>
  @endif

  <div class="divider"></div>

  @if ($isA4)
    <table class="items">
      <thead>
        <tr>
          <th>Article</th>
          <th class="right">Qté</th>
          <th class="right">Prix</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        @foreach ($items as $item)
          <tr>
            <td>
              {{ $item['title'] }}
              @if ($item['label'])
                <div class="item-variant">{{ $item['label'] }}</div>
              @endif
            </td>
            <td class="right">{{ $item['quantity'] }}</td>
            <td class="right">{{ $money($item['unit_price']) }}</td>
            <td class="right">{{ $money($item['total']) }}</td>
          </tr>
        @endforeach
      </tbody>
    </table>
  @else
    @foreach ($items as $item)
      <div style="margin-bottom: 6px;">
        <div>{{ $item['title'] }}</div>
        @if ($item['label'])
          <div class="item-variant">{{ $item['label'] }}</div>
        @endif
        <table>
          <tr>
            <td class="muted">{{ $item['quantity'] }} × {{ $money($item['unit_price']) }}</td>
            <td class="right">{{ $money($item['total']) }}</td>
          </tr>
        </table>
      </div>
    @endforeach
  @endif

  <div class="divider"></div>

  <table class="totals">
    <tr>
      <td class="label">Sous-total</td>
      <td class="right">{{ $money($subtotal) }}</td>
    </tr>
    @if ($discount > 0)
      <tr>
        <td class="label">Remise</td>
        <td class="right">-{{ $money($discount) }}</td>
      </tr>
    @endif
    @if ($tax > 0)
      <tr>
        <td class="label">Taxe</td>
        <td class="right">{{ $money($tax) }}</td>
      </tr>
    @endif
  </table>

  <div class="total-box">
    <div class="label">Total</div>
    <div class="amount">{{ $money($total) }}</div>
  </div>

  <div class="section-title">Paiement</div>
  <table class="totals">
    @foreach ($payments as $payment)
      <tr>
        <td class="label">{{ $payment['label'] }}</td>
        <td class="right">{{ $money($payment['amount']) }}</td>
      </tr>
      @if ($payment['received'] !== null)
        <tr>
          <td class="label">Montant reçu</td>
          <td class="right">{{ $money($payment['received']) }}</td>
        </tr>
      @endif
    @endforeach
    @if ($change > 0)
      <tr>
        <td class="label">Monnaie</td>
        <td class="right">{{ $money($change) }}</td>
      </tr>
    @endif
  </table>

  <div class="center">
    <span class="status">{{ $statusLabel }}</span>
  </div>

  @if ($qr_image)
    <div class="qr">
      <img src="{{ $qr_image }}" alt="QR code du reçu">
    </div>
  @endif

  <div class="footer">
    @if ($merchant['thank_you_message'])
      <div class="thanks">{{ $merchant['thank_you_message'] }}</div>
    @else
      <div class="thanks">Merci pour votre confiance.</div>
    @endif
    @if ($merchant['website'])
      <div>{{ $merchant['website'] }}</div>
    @endif
    @if ($merchant['whatsapp'])
      <div>{{ $merchant['whatsapp'] }}</div>
    @endif
    @if ($merchant['footer_text'])
      <div>{{ $merchant['footer_text'] }}</div>
    @endif
  </div>

</body>
</html>
