<?php

declare(strict_types=1);

return [
    'driver' => env('PAYMENTS_GATEWAY', 'null'),
    'webhook_secret' => env('PAYMENTS_WEBHOOK_SECRET', ''),
    'gateways' => [
        'null' => \App\Modules\Payments\Gateways\NullTerminal::class,
        'jeko' => \App\Modules\Payments\Gateways\JekoTerminal::class,
        'jeko-pay' => \App\Modules\Payments\Gateways\JekoTerminal::class,
    ],
    'jeko' => [
        'base_url' => env('JEKO_API_BASE_URL', 'https://api.jeko.africa'),
        'api_key' => env('JEKO_API_KEY', ''),
        'api_key_id' => env('JEKO_API_KEY_ID', ''),
        'store_id' => env('JEKO_STORE_ID', ''),
        'webhook_secret' => env('JEKO_WEBHOOK_SECRET', ''),
        // Jeko rejette les URLs de redirection non publiques (localhost) : ce
        // repli sert uniquement à tester de vrais paiements Jeko en local. Il
        // doit être explicitement configuré — pas de valeur en dur, pour ne
        // jamais rediriger silencieusement un environnement mal configuré
        // (staging sans FRONTEND_URL, par ex.) vers la production.
        'redirect_fallback_url' => env('JEKO_REDIRECT_FALLBACK_URL'),
    ],
];
