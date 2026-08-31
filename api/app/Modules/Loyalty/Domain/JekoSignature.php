<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Domain;

final class JekoSignature
{
    public static function valid(string $rawBody, ?string $signature, string $secret): bool
    {
        if ($signature === null || $signature === '' || $secret === '') {
            return false;
        }

        $received = strtolower(trim($signature));

        if (str_starts_with($received, 'sha256=')) {
            $received = substr($received, 7);
        }

        $expected = hash_hmac('sha256', $rawBody, $secret);

        return hash_equals($expected, $received);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public static function reference(array $payload): string
    {
        $candidates = [
            $payload['id'] ?? null,
            $payload['transactionDetails']['reference'] ?? null,
            $payload['reference'] ?? null,
            $payload['paymentRequest']['reference'] ?? null,
        ];

        foreach ($candidates as $candidate) {
            if (is_string($candidate) && $candidate !== '') {
                return $candidate;
            }
        }

        return '';
    }
}
