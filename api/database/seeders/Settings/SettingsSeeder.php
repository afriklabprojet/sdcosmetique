<?php

declare(strict_types=1);

namespace Database\Seeders\Settings;

use App\Modules\Settings\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->rows() as $key => $row) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                [
                    'value' => $row['value'],
                    'is_public' => $row['is_public'],
                ],
            );
        }
    }

    /**
     * @return array<string, array{value: mixed, is_public: bool}>
     */
    private function rows(): array
    {
        $hero = [
            'eyebrow' => 'Soins du visage',
            'title' => 'Visage',
            'titleAccent' => "l'éclat révélé",
            'lead' => 'Sérums, masques et huiles formulés spécialement pour les peaux mélanisées.',
            'image' => '/categories/visage.png',
        ];

        return [
            'topbar' => [
                'is_public' => true,
                'value' => [
                    'message' => "Livraison rapide partout en Côte d'Ivoire et à l'international",
                    'phone' => '+225 07 49 49 49 49',
                ],
            ],
            'hero' => [
                'is_public' => true,
                'value' => [
                    'eyebrow' => 'SOINS PREMIUM POUR TOUS LES TEINTS',
                    'title' => 'Révélez la beauté',
                    'titleAccent' => 'naturelle de votre teint',
                    'lead' => "Des produits d'exception, formulés pour sublimer chaque type de peau.",
                    'ctaText' => 'DÉCOUVRIR NOS PRODUITS',
                    'ctaHref' => '/categorie/gammes',
                    'image' => '/hero/generated-skincare-hero-3.jpg',
                    'imageAlt' => 'Modèle aux soins SD Cosmétique',
                ],
            ],
            'trust_items' => [
                'is_public' => true,
                'value' => [
                    ['label' => 'Ingrédients naturels et certifiés'],
                    ['label' => 'Formules testées dermatologiquement'],
                    ['label' => 'Livraison rapide et sécurisée'],
                ],
            ],
            'testimonials_home' => ['is_public' => true, 'value' => []],
            'product_trust' => [
                'is_public' => true,
                'value' => [
                    ['icon' => 'truck', 'label' => 'Livraison rapide', 'sub' => 'en 24h - 48h'],
                    ['icon' => 'shield', 'label' => 'Produits authentiques', 'sub' => '100% certifiés'],
                ],
            ],
            'payment_badges' => [
                'is_public' => true,
                'value' => [
                    ['label' => 'Orange Money', 'bg' => '#FF6600'],
                    ['label' => 'Wave', 'bg' => '#0066CC'],
                ],
            ],
            'hero_face' => ['is_public' => true, 'value' => $hero],
            'hero_body' => ['is_public' => true, 'value' => [...$hero, 'title' => 'Corps', 'image' => '/categories/corps.png']],
            'hero_gammes' => ['is_public' => true, 'value' => [...$hero, 'title' => 'Gammes', 'image' => '/categories/gammes.png']],
            'hero_kit_levre' => ['is_public' => true, 'value' => [...$hero, 'title' => 'Kit Lèvre']],
            'hero_minceur' => ['is_public' => true, 'value' => [...$hero, 'title' => 'Minceur']],
            'hero_kits' => ['is_public' => true, 'value' => $hero],
            'hero_duo' => ['is_public' => true, 'value' => $hero],
            'hero_quiz' => ['is_public' => true, 'value' => $hero],
            'hero_teint_noir' => ['is_public' => true, 'value' => $hero],
            'hero_teint_marron' => ['is_public' => true, 'value' => $hero],
            'hero_teint_marron_clair' => ['is_public' => true, 'value' => $hero],
            'hero_teint_clair' => ['is_public' => true, 'value' => $hero],
            'hero_teint_metisse' => ['is_public' => true, 'value' => $hero],
            'skin_tone_section_title' => ['is_public' => true, 'value' => 'Choisissez votre teint'],
            'product_tone_images' => [
                'is_public' => true,
                'value' => [
                    'noir' => '/hero/skintone-noir.svg',
                    'marron' => '/hero/skintone-marron.svg',
                    'marron_clair' => '/hero/skintone-marron-clair.svg',
                    'clair' => '/hero/skintone-clair.svg',
                    'metisse' => '/hero/skintone-metisse.svg',
                ],
            ],
            'faq' => ['is_public' => true, 'value' => []],
            'legal_mentions' => ['is_public' => true, 'value' => ['title' => 'Mentions légales', 'bodyHtml' => '']],
            'legal_cgv' => ['is_public' => true, 'value' => ['title' => 'CGV', 'bodyHtml' => '']],
            'legal_confidentialite' => ['is_public' => true, 'value' => ['title' => 'Confidentialité', 'bodyHtml' => '']],
            'legal_engagements' => ['is_public' => true, 'value' => ['title' => 'Nos engagements', 'bodyHtml' => '']],
            'legal_contact' => [
                'is_public' => true,
                'value' => [
                    'title' => 'Nous écrire',
                    'contactEmail' => 'contact@sdcosmetique.ci',
                    'contactPhone' => '+225 07 49 49 49 49',
                ],
            ],
            'newsletter' => ['is_public' => true, 'value' => ['enabled' => true]],
            'marketing' => ['is_public' => true, 'value' => []],
            'branding' => [
                'is_public' => true,
                'value' => ['siteName' => 'SD Cosmétique', 'logoUrl' => '/logo.svg'],
            ],
            'payment_methods_active' => [
                'is_public' => true,
                'value' => ['orange_money', 'wave', 'mtn_momo', 'moov_money', 'djamo', 'cash_on_delivery'],
            ],
            'global_promo' => ['is_public' => true, 'value' => ['enabled' => false]],
            'jeko' => [
                'is_public' => false,
                'value' => ['storeId' => '', 'apiKey' => ''],
            ],
        ];
    }
}
