<?php

declare(strict_types=1);

namespace Database\Factories\Content;

use App\Modules\Content\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    protected $model = Page::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);

        return [
            'slug' => Str::slug($title),
            'title' => $title,
            'content' => '<p>'.fake()->paragraph().'</p>',
            'published_at' => now(),
        ];
    }
}
