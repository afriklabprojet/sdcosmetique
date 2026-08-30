<?php

declare(strict_types=1);

namespace Database\Factories\Shared;

use App\Modules\Catalog\Models\Product;
use App\Shared\Translations\Translation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Translation>
 */
class TranslationFactory extends Factory
{
    protected $model = Translation::class;

    public function definition(): array
    {
        return [
            'translatable_type' => Product::class,
            'translatable_id' => Product::factory(),
            'locale' => 'fr',
            'field' => 'title',
            'value' => 'Titre traduit',
        ];
    }
}
