<?php

declare(strict_types=1);

namespace App\Shared\Branding;

use App\Modules\Settings\Models\Setting;

/**
 * Coordonnées boutique — un seul et même réglage (Paramètres > Détails de la
 * facture) alimente à la fois le PDF de facture (`InvoicePdfBuilder`) et le
 * bandeau/pied de page de tous les e-mails. Un admin qui met à jour son logo
 * ou son adresse une fois le voit partout, sans rien reconfigurer ailleurs —
 * c'est le but explicite : rendre le module facile à paramétrer.
 */
class ShopProfile
{
    /**
     * @return array<string, mixed>
     */
    public static function current(): array
    {
        $shop = Setting::query()->where('key', 'invoice_details')->value('value') ?? [];

        return [
            'logoUrl' => $shop['logoUrl'] ?? null,
            'businessName' => $shop['businessName'] ?? 'SD Cosmétique',
            'legalName' => $shop['legalName'] ?? '',
            'phone' => $shop['phone'] ?? '',
            'phoneSecondary' => $shop['phoneSecondary'] ?? '',
            'whatsapp' => $shop['whatsapp'] ?? '',
            'email' => $shop['email'] ?? '',
            'website' => $shop['website'] ?? config('app.frontend_url'),
            'address' => $shop['address'] ?? '',
            'city' => $shop['city'] ?? '',
            'country' => $shop['country'] ?? '',
            'rccm' => $shop['rccm'] ?? '',
            'taxId' => $shop['taxId'] ?? '',
            'footerText' => $shop['footerText'] ?? '',
            'terms' => $shop['terms'] ?? '',
            'thankYouMessage' => $shop['thankYouMessage'] ?? '',
        ];
    }
}
