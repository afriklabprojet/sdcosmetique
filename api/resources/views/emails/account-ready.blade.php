@extends('emails.layout', ['title' => 'Votre espace client SD Cosmétique est disponible'])

@section('content')
<p style="margin:0 0 18px; font-size:13px; text-transform:uppercase; letter-spacing:0.12em; color:#8F5922; font-weight:700;">Bienvenue</p>
<h1 style="margin:0 0 18px; font-size:22px; color:#1A0E05; font-family:Georgia, 'Times New Roman', serif;">Votre espace client est disponible</h1>
<p style="margin:0 0 8px;">Bonjour {{ $name }},</p>
<p style="margin:0 0 18px;">Merci pour votre commande ! Votre espace client SD Cosmétique a été automatiquement créé avec l'adresse <strong>{{ $email }}</strong>.</p>
<p style="margin:0 0 18px;">Vous pouvez désormais consulter l'historique de vos commandes et vos informations personnelles à tout moment.</p>

<p style="margin:0 0 8px; font-weight:700;">Pour vous connecter, vous pouvez :</p>
<ul style="margin:0 0 24px; padding-left:20px;">
  <li style="margin-bottom:6px;">Recevoir un code de connexion par e-mail — aucun mot de passe requis.</li>
  <li>Ou créer un mot de passe depuis votre espace client, dans l'onglet Sécurité.</li>
</ul>

<div style="text-align:center; margin:0 0 8px;">
  <a href="{{ $siteUrl }}/compte" style="display:inline-block; padding:13px 32px; background:#1A0E05; color:#ffffff; text-decoration:none; border-radius:6px; font-size:13px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;">Accéder à mon espace client</a>
</div>

<p style="margin:18px 0 0; font-size:13px; color:#8C7B6E;">Nous ne vous enverrons jamais votre mot de passe par e-mail.</p>
@endsection
