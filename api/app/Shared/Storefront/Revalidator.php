<?php

declare(strict_types=1);

namespace App\Shared\Storefront;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

final class Revalidator
{
    /**
     * @param  list<string>  $tags
     */
    public static function tags(array $tags): void
    {
        $url = rtrim((string) config('services.web.url'), '/');
        $secret = (string) config('services.web.revalidate_secret');

        if ($url === '' || $secret === '' || $tags === []) {
            return;
        }

        try {
            Http::timeout(2)
                ->withHeader('x-revalidate-secret', $secret)
                ->post($url.'/api/revalidate', ['tags' => $tags]);
        } catch (Throwable $e) {
            Log::warning('Storefront revalidation failed', [
                'tags' => $tags,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
