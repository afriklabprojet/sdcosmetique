@extends('emails.layout', [
    'title' => $shop['businessName'] ?? 'SD Cosmétique',
    'shop' => $shop,
    'unsubscribeUrl' => $unsubscribeUrl,
])

@section('content')
<div style="font-size:15px; line-height:1.7; color:#1A0E05;">
    {!! $bodyHtml !!}
</div>
@endsection
