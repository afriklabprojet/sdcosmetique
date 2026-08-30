<?php

declare(strict_types=1);

return [
    'driver' => env('PAYMENTS_GATEWAY', 'null'),
    'webhook_secret' => env('PAYMENTS_WEBHOOK_SECRET', ''),
    'cinetpay' => [
        'api_key' => env('CINETPAY_API_KEY', ''),
        'site_id' => env('CINETPAY_SITE_ID', ''),
        'init_url' => env('CINETPAY_INIT_URL', 'https://api-checkout.cinetpay.com/v2/payment'),
        'check_url' => env('CINETPAY_CHECK_URL', 'https://api-checkout.cinetpay.com/v2/payment/check'),
    ],
];
