<?php

declare(strict_types=1);

namespace App\Shared\Receipt;

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;

/** Génère l'image QR du reçu (§14) — un seul point de génération, réutilisé tel quel par l'aperçu web et le PDF (§34). */
final class ReceiptQrCode
{
    /** Data-URI PNG — jamais de données sensibles encodées, uniquement l'URL du reçu (§14). */
    public static function dataUri(string $url): string
    {
        $result = (new Builder(
            writer: new PngWriter,
            data: $url,
            size: 240,
            margin: 8,
        ))->build();

        return $result->getDataUri();
    }
}
