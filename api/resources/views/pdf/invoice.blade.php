<?php
/**
 * @var array<string, mixed> $shop
 * @var array<string, mixed> $invoice
 * @var array<string, mixed> $order
 * @var array<string, mixed> $client
 * @var list<array<string, mixed>> $items
 * @var array<string, int> $totals
 */
use App\Modules\Invoicing\Domain\InvoicePdfBuilder;

$money = static fn (int $amount): string => InvoicePdfBuilder::formatMoney($amount);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Facture {{ $invoice['number'] }}</title>
<style>
  @page { margin: 26px 28px 60px 28px; }
  * { box-sizing: border-box; }
  body { font-family: 'DejaVu Sans', Arial, Helvetica, sans-serif; font-size: 10.5px; color: #1A0E05; margin: 0; }
  table { border-collapse: collapse; width: 100%; }
  .header-table td { vertical-align: top; }
  .shop-name { font-size: 16px; font-weight: 700; color: #1A0E05; margin: 0 0 4px; }
  .muted { color: #6B5B4D; }
  .small { font-size: 9.5px; }
  .right { text-align: right; }
  .center { text-align: center; }
  .logo { max-height: 52px; max-width: 170px; }
  .title-bar { background: #8F5922; color: #ffffff; padding: 10px 14px; margin: 16px 0 14px; border-radius: 3px; }
  .title-bar .doc-title { font-size: 15px; font-weight: 700; letter-spacing: 0.04em; }
  .title-bar .doc-meta { font-size: 10px; margin-top: 2px; color: #F4E8D8; }
  .panel { border: 1px solid #E5D9C8; border-radius: 3px; padding: 10px 12px; }
  .panel-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #8F5922; margin: 0 0 6px; }
  .cols td { vertical-align: top; padding-right: 10px; }
  .cols td:last-child { padding-right: 0; padding-left: 10px; }
  .items { margin-top: 16px; }
  .items th { background: #F4EBE1; color: #6B3D14; font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em; padding: 7px 8px; text-align: left; border-bottom: 1px solid #E5D9C8; }
  .items td { padding: 7px 8px; border-bottom: 1px solid #F0EBE0; font-size: 10px; }
  .items tr { page-break-inside: avoid; }
  .totals { margin-top: 12px; }
  .totals table { width: 260px; float: right; }
  .totals td { padding: 3px 0; font-size: 10.5px; }
  .totals .label { color: #6B5B4D; }
  .totals .grand td { border-top: 1px solid #1A0E05; padding-top: 6px; font-size: 13px; font-weight: 700; }
  .totals .due td { color: #C0392B; font-weight: 700; }
  .clearfix { clear: both; }
  .payment-line { margin-top: 18px; padding: 10px 12px; background: #FAF6EE; border-radius: 3px; font-size: 10.5px; }
  .payment-line strong { color: #1A0E05; }
  .footer { margin-top: 26px; text-align: center; color: #6B5B4D; }
  .footer .thanks { font-size: 11px; font-weight: 600; color: #1A0E05; white-space: pre-line; margin-bottom: 8px; }
  .footer .legal { font-size: 8.5px; line-height: 1.5; }
</style>
</head>
<body>

  <table class="header-table">
    <tr>
      <td style="width: 55%;">
        @if(!empty($shop['logoUrl']))
          <img src="{{ $shop['logoUrl'] }}" class="logo" alt="{{ $shop['businessName'] }}">
        @else
          <p class="shop-name">{{ $shop['businessName'] }}</p>
        @endif
      </td>
      <td class="right small" style="width: 45%;">
        <p class="shop-name" style="font-size: 12px;">{{ $shop['businessName'] }}</p>
        @if(!empty($shop['address']))<div>{{ $shop['address'] }}</div>@endif
        @if(!empty($shop['city']) || !empty($shop['country']))<div>{{ trim(($shop['city'] ?? '').(!empty($shop['city']) && !empty($shop['country']) ? ', ' : '').($shop['country'] ?? '')) }}</div>@endif
        @if(!empty($shop['phone']))<div>Tél. {{ $shop['phone'] }}</div>@endif
        @if(!empty($shop['email']))<div>{{ $shop['email'] }}</div>@endif
        @if(!empty($shop['website']))<div>{{ $shop['website'] }}</div>@endif
        @if(!empty($shop['rccm']))<div class="muted">RCCM {{ $shop['rccm'] }}</div>@endif
        @if(!empty($shop['taxId']))<div class="muted">Contribuable {{ $shop['taxId'] }}</div>@endif
      </td>
    </tr>
  </table>

  <div class="title-bar">
    <table><tr>
      <td class="doc-title">FACTURE / REÇU</td>
      <td class="right">
        <div class="doc-title">{{ $invoice['number'] }}</div>
        <div class="doc-meta">Émise le {{ $invoice['issuedAt']->translatedFormat('d F Y à H:i') }}</div>
      </td>
    </tr></table>
  </div>

  <table class="cols">
    <tr>
      <td style="width: 50%;">
        <div class="panel">
          <p class="panel-title">Client</p>
          <div><strong>{{ $client['name'] ?: 'Client' }}</strong></div>
          @if(!empty($client['phone']))<div>{{ $client['phone'] }}</div>@endif
          @if(!empty($client['email']))<div>{{ $client['email'] }}</div>@endif
        </div>
      </td>
      <td style="width: 50%;">
        <div class="panel">
          <p class="panel-title">Livraison</p>
          @if(!empty($client['address']))<div>{{ $client['address'] }}</div>@endif
          @if(!empty($client['city']) || !empty($client['country']))
            <div>{{ trim(($client['city'] ?? '').(!empty($client['city']) && !empty($client['country']) ? ', ' : '').($client['country'] ?? '')) }}</div>
          @endif
          @if(empty($client['address']) && empty($client['city']))<div class="muted">Non renseignée</div>@endif
        </div>
      </td>
    </tr>
  </table>

  <table class="cols" style="margin-top: 10px;">
    <tr>
      <td style="width: 50%;">
        <div class="panel small">
          <span class="muted">N° commande</span> <strong>{{ $order['reference'] }}</strong><br>
          <span class="muted">Date de commande</span> {{ $order['placedAt']?->translatedFormat('d/m/Y à H:i') ?? '—' }}
        </div>
      </td>
      <td style="width: 50%;">
        <div class="panel small">
          <span class="muted">Paiement</span> <strong>{{ $order['paymentMethod'] }}</strong> — {{ $order['paymentStatus'] }}<br>
          <span class="muted">Statut commande</span> {{ $order['orderStatus'] }}
        </div>
      </td>
    </tr>
  </table>

  <table class="items">
    <thead>
      <tr>
        <th style="width: 46%;">Produit</th>
        <th class="center" style="width: 12%;">Qté</th>
        <th class="right" style="width: 21%;">Prix unitaire</th>
        <th class="right" style="width: 21%;">Total</th>
      </tr>
    </thead>
    <tbody>
      @foreach($items as $item)
        <tr>
          <td>
            {{ $item['title'] }}
            @if(!empty($item['variant']))<br><span class="small muted">{{ $item['variant'] }}</span>@endif
          </td>
          <td class="center">{{ $item['quantity'] }}</td>
          <td class="right">{{ $money($item['unitPrice']) }}</td>
          <td class="right">{{ $money($item['total']) }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td class="label">Sous-total</td><td class="right">{{ $money($totals['subtotal']) }}</td></tr>
      @if($totals['discount'] > 0)
        <tr><td class="label">Réduction</td><td class="right">-{{ $money($totals['discount']) }}</td></tr>
      @endif
      <tr><td class="label">Livraison</td><td class="right">{{ $totals['shipping'] > 0 ? $money($totals['shipping']) : 'Gratuite' }}</td></tr>
      <tr class="grand"><td>Total</td><td class="right">{{ $money($totals['total']) }}</td></tr>
      <tr><td class="label">Montant payé</td><td class="right">{{ $money($totals['paid']) }}</td></tr>
      @if($totals['due'] > 0)
        <tr class="due"><td>Reste à payer</td><td class="right">{{ $money($totals['due']) }}</td></tr>
      @endif
    </table>
    <div class="clearfix"></div>
  </div>

  @if(!empty($shop['terms']))
    <div class="payment-line">{{ $shop['terms'] }}</div>
  @endif

  <div class="footer">
    @if(!empty($shop['thankYouMessage']))<div class="thanks">{{ $shop['thankYouMessage'] }}</div>@endif
    <div class="legal">
      {{ $shop['businessName'] }}
      @if(!empty($shop['legalName'])) — {{ $shop['legalName'] }}@endif
      @if(!empty($shop['address'])) · {{ $shop['address'] }}@endif
      <br>
      @if(!empty($shop['phone'])){{ $shop['phone'] }}@endif
      @if(!empty($shop['phoneSecondary'])) / {{ $shop['phoneSecondary'] }}@endif
      @if(!empty($shop['whatsapp'])) · WhatsApp {{ $shop['whatsapp'] }}@endif
      @if(!empty($shop['email'])) · {{ $shop['email'] }}@endif
      @if(!empty($shop['website'])) · {{ $shop['website'] }}@endif
      @if(!empty($shop['footerText']))<br>{{ $shop['footerText'] }}@endif
    </div>
  </div>

</body>
</html>
