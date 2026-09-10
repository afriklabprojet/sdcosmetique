@extends('emails.layout', [
    'title' => 'Message de '.($shop['businessName'] ?? 'SD Cosmétique'),
    'shop' => $shop,
])

@section('content')
<p style="margin:0 0 16px; font-size:12.5px; text-transform:uppercase; letter-spacing:0.12em; color:#8F5922; font-weight:700;">Message de {{ $shop['businessName'] ?? 'SD Cosmétique' }}</p>
<div style="font-size:15px; line-height:1.7; color:#1A0E05;">
    {!! $bodyHtml !!}
</div>
@endsection
