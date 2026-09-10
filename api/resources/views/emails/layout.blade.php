<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{{ $title ?? 'SD Cosmétique' }}</title>
<!--[if mso]>
<style>table {border-collapse:collapse;} * {font-family: Arial, Helvetica, sans-serif !important;}</style>
<![endif]-->
<style>
  /* Typographie du contenu saisi via l'éditeur riche (messages/campagnes) — la
     plupart des webmails modernes (Gmail, Apple Mail) gardent ce <style>. */
  h1, h2, h3 { color:#1A0E05; font-family:Georgia,'Times New Roman',serif; line-height:1.3; margin:20px 0 10px; }
  h2 { font-size:19px; }
  h3 { font-size:16px; }
  p { margin:0 0 14px; }
  ul, ol { margin:0 0 14px; padding-left:20px; }
  li { margin-bottom:4px; }
  a { color:#8F5922; }
  img { max-width:100%; border-radius:8px; height:auto; }
  blockquote { margin:0 0 14px; padding:10px 16px; border-left:3px solid #E2D9CF; color:#6B5B4D; }
</style>
</head>
<body style="margin:0; padding:0; background-color:#F3EEE6; font-family:Arial, Helvetica, sans-serif;">
@if(!empty($preheader ?? null))
<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
    {{ $preheader }}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>
@endif
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3EEE6; padding:28px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 2px 12px rgba(43,26,10,0.06);">

        {{-- Bandeau boutique --}}
        <tr>
          <td style="background:linear-gradient(135deg,#8F5922,#6E4318); padding:32px 32px 28px; text-align:center;">
            @if(!empty($shop['logoUrl'] ?? null) && str_starts_with($shop['logoUrl'], 'http'))
              <img src="{{ $shop['logoUrl'] }}" alt="{{ $shop['businessName'] ?? 'SD Cosmétique' }}" height="40" style="height:40px; max-width:220px; object-fit:contain; display:inline-block;">
            @else
              <span style="display:inline-block; width:48px; height:48px; line-height:48px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.55); color:#ffffff; font-size:17px; font-weight:700; letter-spacing:0.02em; font-family:Georgia,'Times New Roman',serif;">SD</span>
            @endif
            <div style="color:#F4E8D8; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; margin-top:12px; font-weight:600;">{{ $shop['businessName'] ?? 'SD Cosmétique' }}</div>
          </td>
        </tr>

        {{-- Contenu --}}
        <tr>
          <td style="padding:36px 32px; color:#1A0E05; font-size:15px; line-height:1.7;">
            @yield('content')
          </td>
        </tr>

        {{-- Pied de page boutique --}}
        <tr>
          <td style="padding:24px 32px 28px; border-top:1px solid #F0EBE0; text-align:center;">
            <p style="margin:0 0 4px; font-size:13px; color:#4A3B2E; font-weight:700;">{{ $shop['businessName'] ?? 'SD Cosmétique' }}</p>
            @if(!empty($shop['address'] ?? null) || !empty($shop['city'] ?? null))
              <p style="margin:0 0 2px; font-size:11.5px; color:#9A8A7A;">{{ trim(($shop['address'] ?? '').(!empty($shop['city'] ?? null) ? ', '.$shop['city'] : '')) }}</p>
            @endif
            @if(!empty($shop['phone'] ?? null) || !empty($shop['email'] ?? null))
              <p style="margin:0 0 10px; font-size:11.5px; color:#9A8A7A;">
                @if(!empty($shop['phone'] ?? null)){{ $shop['phone'] }}@endif
                @if(!empty($shop['phone'] ?? null) && !empty($shop['email'] ?? null))&nbsp;·&nbsp;@endif
                @if(!empty($shop['email'] ?? null)){{ $shop['email'] }}@endif
              </p>
            @endif
            <p style="margin:0; font-size:11.5px;">
              <a href="{{ $shop['website'] ?? config('app.frontend_url') }}" style="color:#8F5922; text-decoration:none; font-weight:600;">{{ preg_replace('#^https?://#', '', rtrim($shop['website'] ?? config('app.frontend_url'), '/')) }}</a>
            </p>
            @if(!empty($unsubscribeUrl ?? null))
              <p style="margin:16px 0 0; padding-top:14px; border-top:1px solid #F5F0E8; font-size:10.5px; color:#B3A493; line-height:1.6;">
                Vous recevez cet e-mail car vous êtes client {{ $shop['businessName'] ?? 'SD Cosmétique' }}.<br>
                <a href="{{ $unsubscribeUrl }}" style="color:#8F5922; text-decoration:underline;">Se désabonner des e-mails marketing</a>
              </p>
            @endif
          </td>
        </tr>
      </table>
      <p style="max-width:600px; margin:16px auto 0; font-size:10.5px; color:#B3A493; text-align:center;">
        © {{ date('Y') }} {{ $shop['businessName'] ?? 'SD Cosmétique' }}. Tous droits réservés.
      </p>
    </td>
  </tr>
</table>
</body>
</html>
