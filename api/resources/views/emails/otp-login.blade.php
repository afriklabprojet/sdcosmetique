@extends('emails.layout', ['title' => 'Votre code de connexion SD Cosmétique'])

@section('content')
<p style="margin:0 0 18px; font-size:13px; text-transform:uppercase; letter-spacing:0.12em; color:#8F5922; font-weight:700;">Connexion</p>
<h1 style="margin:0 0 18px; font-size:22px; color:#1A0E05; font-family:Georgia, 'Times New Roman', serif;">Votre code de connexion</h1>
<p style="margin:0 0 8px;">Bonjour {{ $name }},</p>
<p style="margin:0 0 24px;">Voici votre code de connexion à SD Cosmétique :</p>

<div style="text-align:center; margin:0 0 24px;">
  <span style="display:inline-block; padding:16px 28px; background:#FDFAF7; border:1.5px solid #E2D9CF; border-radius:10px; font-size:32px; font-weight:700; letter-spacing:0.18em; color:#8F5922; font-family:Georgia, 'Times New Roman', serif;">{{ $code }}</span>
</div>

<p style="margin:0 0 8px;">Ce code est valable pendant <strong>10 minutes</strong> et ne peut être utilisé qu'une seule fois.</p>
<p style="margin:0; font-size:13px; color:#8C7B6E;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité — aucune action n'est requise de votre part.</p>
@endsection
