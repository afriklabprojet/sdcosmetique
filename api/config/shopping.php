<?php

declare(strict_types=1);

return [
    /*
     * Placeholder XOF minor units, copied from V1 FREE_SHIP_THRESHOLD = 49.
     * Replace when the client tariff list arrives (R6).
     */
    'free_shipping_threshold' => (int) env('FREE_SHIPPING_THRESHOLD', 49),
];
