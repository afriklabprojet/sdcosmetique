<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Désabonnement — SD Cosmétique</title>
</head>
<body style="margin:0; padding:0; background-color:#F8F4EF; font-family:Arial, Helvetica, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:420px; background-color:#ffffff; border-radius:12px; padding:36px 32px; text-align:center; border:1px solid #EDE5DC;">
        <span style="display:inline-block; width:44px; height:44px; line-height:44px; border-radius:50%; background:#8F5922; color:#ffffff; font-size:16px; font-weight:700;">SD</span>
        <h1 style="font-size:19px; color:#1A0E05; margin:20px 0 10px;">Vous êtes désabonné(e)</h1>
        <p style="font-size:14px; color:#6B5B4D; line-height:1.6; margin:0;">
            @if($email)
                L'adresse <strong>{{ $email }}</strong> ne recevra plus d'e-mails marketing de SD Cosmétique.
            @else
                Vous ne recevrez plus d'e-mails marketing de SD Cosmétique.
            @endif
        </p>
        <p style="font-size:12px; color:#9A8A7A; margin-top:18px;">
            Vous continuerez à recevoir les e-mails liés à vos commandes (confirmation, facture, livraison).
        </p>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
