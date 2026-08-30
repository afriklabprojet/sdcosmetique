<?php

declare(strict_types=1);

namespace Database\Seeders\Content;

use App\Modules\Content\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        Page::query()->updateOrCreate(
            ['slug' => 'about'],
            [
                'title' => 'Our story',
                'content' => <<<'HTML'
<h3>Rooted in ritual, backed by science.</h3>
<p>Skincare should feel intuitive, not complicated.</p>
<h4>Our story begins with a drop</h4>
<p>Rosaline started in a small lab with a stubborn question: why did every product that actually worked feel so punishing to use? The answer, mostly, was that efficacy and comfort had been treated as a trade-off rather than a design problem.</p>
<p>So we built formulas around both. Every product we ship has to clear two bars — a measurable result over twelve weeks, and a texture you would happily use twice a day without thinking about it.</p>
HTML,
                'published_at' => now(),
            ],
        );
    }
}
