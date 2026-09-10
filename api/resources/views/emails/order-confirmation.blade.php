@extends('emails.layout', [
    'title' => 'Confirmation de votre commande SD Cosmétique',
    'preheader' => 'Commande #'.$reference.' confirmée — facture en pièce jointe.',
    'shop' => $shop,
])

@section('content')
<p style="margin:0 0 16px; font-size:12.5px; text-transform:uppercase; letter-spacing:0.12em; color:#8F5922; font-weight:700;">✓ Commande confirmée</p>
<h1 style="margin:0 0 18px; font-size:23px; line-height:1.3; color:#1A0E05; font-family:Georgia, 'Times New Roman', serif;">Merci pour votre commande{{ $firstName ? ', '.$firstName : '' }} !</h1>
<p style="margin:0 0 8px;">Votre commande <strong>#{{ $reference }}</strong> est confirmée et en cours de préparation.</p>
<p style="margin:0 0 26px;">Votre facture (n° {{ $invoiceNumber }}) est jointe à cet e-mail au format PDF.</p>

<div style="background:#FDFAF7; border:1.5px solid #E2D9CF; border-radius:12px; padding:20px 22px; margin:0 0 26px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="font-size:13px; color:#6B5B4D;">Numéro de commande</td>
      <td style="font-size:13px; color:#1A0E05; font-weight:600; text-align:right;">{{ $reference }}</td>
    </tr>
    <tr>
      <td style="font-size:13px; color:#6B5B4D; padding-top:8px;">Total</td>
      <td style="font-size:16px; color:#8F5922; font-weight:700; text-align:right; padding-top:8px;">{{ number_format($total, 0, ',', "\u{00A0}") }} FCFA</td>
    </tr>
  </table>
</div>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 26px;">
  <tr>
    <td style="border-radius:9px; background:#8F5922;">
      <a href="{{ rtrim($siteUrl, '/') }}/order/{{ $reference }}" style="display:inline-block; padding:13px 28px; font-size:13.5px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:9px;">Suivre ma commande →</a>
    </td>
  </tr>
</table>

<p style="margin:0; font-size:13px; color:#8C7B6E; line-height:1.6;">
    {!! nl2br(e($shop['thankYouMessage'] ?: 'Merci pour votre confiance.')) !!}
</p>
@endsection
