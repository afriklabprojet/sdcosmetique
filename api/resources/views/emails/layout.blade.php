<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ $title ?? 'SD Cosmétique' }}</title>
</head>
<body style="margin:0; padding:0; background-color:#F8F4EF; font-family:Georgia, 'Times New Roman', serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F4EF; padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #EDE5DC;">
        <tr>
          <td style="background-color:#8F5922; padding:28px 32px; text-align:center;">
            <span style="display:inline-block; width:44px; height:44px; line-height:44px; border-radius:50%; border:1px solid rgba(255,255,255,0.6); color:#ffffff; font-size:16px; font-weight:700; letter-spacing:0.02em;">SD</span>
            <div style="color:#F4E8D8; font-size:13px; letter-spacing:0.16em; text-transform:uppercase; margin-top:10px; font-family:Arial, Helvetica, sans-serif;">SD Cosmétique</div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px; color:#1A0E05; font-size:15px; line-height:1.65; font-family:Arial, Helvetica, sans-serif;">
            @yield('content')
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 28px; border-top:1px solid #F0EBE0; text-align:center; font-family:Arial, Helvetica, sans-serif;">
            <p style="margin:0; font-size:12px; color:#9A8A7A;">SD Cosmétique — Révélez votre éclat naturel.</p>
            <p style="margin:6px 0 0; font-size:12px;">
              <a href="{{ $siteUrl ?? config('app.frontend_url') }}" style="color:#8F5922; text-decoration:none;">{{ $siteUrl ?? config('app.frontend_url') }}</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
