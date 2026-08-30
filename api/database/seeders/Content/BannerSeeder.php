<?php

declare(strict_types=1);

namespace Database\Seeders\Content;

use App\Modules\Content\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $slides = [
            [
                'key' => 'home-slide-1',
                'title' => 'Reveal Your Natural Rosaline',
                'subtitle' => 'Gentle skincare made for everyday radiance. Clean, vegan, and cruelty-free.',
                'image_url' => '/assets/images/slider/slider-2.jpg',
                'order' => 0,
                'metadata' => ['tag' => 'TAKE THE CHANCE', 'hero_card' => 'vitamin-c-brightening-serum'],
            ],
            [
                'key' => 'home-slide-2',
                'title' => 'Care That Fits Your Everyday',
                'subtitle' => 'Balanced formulas designed to move naturally with your skin, morning to night.',
                'image_url' => '/assets/images/slider/slider-2_2.jpg',
                'order' => 1,
                'metadata' => ['tag' => 'A DAILY RITUAL', 'hero_card' => 'barrier-repair-moisturizer'],
            ],
            [
                'key' => 'home-slide-3',
                'title' => 'Simple Care, Thoughtfully Done',
                'subtitle' => 'Designed to be used, not overthought — made to feel natural, every day.',
                'image_url' => '/assets/images/slider/slider-2_3.jpg',
                'order' => 2,
                'metadata' => ['tag' => 'FORMULATED WITH INTENTION', 'hero_card' => 'invisible-daily-sunscreen-spf50'],
            ],
        ];

        foreach ($slides as $slide) {
            Banner::query()->updateOrCreate(
                ['key' => $slide['key']],
                [
                    'title' => $slide['title'],
                    'subtitle' => $slide['subtitle'],
                    'image_url' => $slide['image_url'],
                    'link_url' => '/shop',
                    'order' => $slide['order'],
                    'visible_at' => now(),
                    'metadata' => $slide['metadata'],
                ],
            );
        }
    }
}
