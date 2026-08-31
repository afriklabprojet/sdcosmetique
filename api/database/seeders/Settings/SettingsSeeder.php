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
            'payment_images' => [
                'is_public' => true,
                'value' => [],
            ],
            'global_promo' => ['is_public' => true, 'value' => ['enabled' => false]],
            'shipping' => [
                'is_public' => true,
                'value' => [
                    'options' => [],
                    'freeShippingMessage' => '',
                ],
            ],
            'jeko' => [
                'is_public' => false,
                'value' => [
                    'storeId' => '',
                    'apiKey' => '',
                    'points_per_1000' => 10,
                    'welcome_bonus' => 20,
                ],
            ],
            'jeko_tiers' => [
                'is_public' => false,
                'value' => [
                    ['label' => 'Bronze', 'min' => 0, 'next' => 50, 'emoji' => '🥉', 'color' => '#CD7F32', 'bg' => '#FDF6EE', 'textColor' => '#92400E'],
                    ['label' => 'Argent', 'min' => 50, 'next' => 200, 'emoji' => '⭐', 'color' => '#6B7280', 'bg' => '#F9FAFB', 'textColor' => '#374151'],
                    ['label' => 'Gold', 'min' => 200, 'next' => 500, 'emoji' => '👑', 'color' => '#C8974A', 'bg' => '#FFF7ED', 'textColor' => '#92400E'],
                    ['label' => 'Platine', 'min' => 500, 'next' => 1000, 'emoji' => '✨', 'color' => '#9333EA', 'bg' => '#FAF5FF', 'textColor' => '#7C3AED'],
                    ['label' => 'Diamant', 'min' => 1000, 'next' => null, 'emoji' => '💎', 'color' => '#0EA5E9', 'bg' => '#F0F9FF', 'textColor' => '#0369A1'],
                ],
            ],
            'jeko_rewards' => [
                'is_public' => false,
                'value' => [
                    ['id' => 'r100', 'pts' => 100, 'label' => '-1 000 FCFA', 'icon' => '🎁', 'description' => '1 000 FCFA de réduction sur votre prochaine commande', 'active' => true],
                    ['id' => 'r300', 'pts' => 300, 'label' => '-3 000 FCFA', 'icon' => '💎', 'description' => '3 000 FCFA de réduction sur votre prochaine commande', 'active' => true],
                    ['id' => 'r500', 'pts' => 500, 'label' => 'Produit offert', 'icon' => '👑', 'description' => 'Un produit au choix jusqu\'à 5 000 FCFA offert', 'active' => true],
                ],
            ],
        ];
    }
}
