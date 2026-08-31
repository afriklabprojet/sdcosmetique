<?php

declare(strict_types=1);

return [
    'driver' => env('PAYMENTS_GATEWAY', 'null'),
    'webhook_secret' => env('PAYMENTS_WEBHOOK_SECRET', ''),
    'gateways' => [
        'null' => \App\Modules\Payments\Gateways\NullTerminal::class,
        'cinetpay' => \App\Modules\Payments\Gateways\CinetPayTerminal::class,
        'jeko' => \App\Modules\Payments\Gateways\JekoTerminal::class,
        'jeko-pay' => \App\Modules\Payments\Gateways\JekoTerminal::class,
    ],
    'cinetpay' => [
        'api_key' => env('CINETPAY_API_KEY', ''),
        'site_id' => env('CINETPAY_SITE_ID', ''),
        'webhook_secret' => env('CINETPAY_WEBHOOK_SECRET', env('PAYMENTS_WEBHOOK_SECRET', '')),
        'init_url' => env('CINETPAY_INIT_URL', 'https://api-checkout.cinetpay.com/v2/payment'),
        'check_url' => env('CINETPAY_CHECK_URL', 'https://api-checkout.cinetpay.com/v2/payment/check'),
    ],
    'jeko' => [
        'base_url' => env('JEKO_API_BASE_URL', 'https://api.jeko.africa'),
        'api_key' => env('JEKO_API_KEY', ''),
        'api_key_id' => env('JEKO_API_KEY_ID', ''),
        'store_id' => env('JEKO_STORE_ID', ''),
        'webhook_secret' => env('JEKO_WEBHOOK_SECRET', ''),
    ],
];
