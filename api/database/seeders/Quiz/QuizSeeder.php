<?php

declare(strict_types=1);

namespace Database\Seeders\Quiz;

use App\Modules\Catalog\Models\Product;
use App\Modules\Quiz\Enums\QuestionType;
use App\Modules\Quiz\Enums\QuizTier;
use App\Modules\Quiz\Models\Question;
use App\Modules\Quiz\Models\Rule;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    public function run(): void
    {
        $this->question('skin_tone', [
            'title' => 'Quelle est votre carnation ?',
            'subtitle' => null,
            'question_type' => QuestionType::ColorPicker,
            'sort_order' => 1,
        ], [
            ['value_code' => 'ebene', 'label' => 'Ébène', 'description' => 'Peau noire profonde', 'glyph' => '●'],
            ['value_code' => 'marron', 'label' => 'Marron foncé', 'description' => 'Peau brune soutenue', 'glyph' => '●'],
            ['value_code' => 'marron_clair', 'label' => 'Marron clair', 'description' => 'Peau brune lumineuse', 'glyph' => '●'],
            ['value_code' => 'claire', 'label' => 'Métissée / Claire', 'description' => 'Peau claire à métissée', 'glyph' => '●'],
        ]);

        $this->question('skin_concern', [
            'title' => 'Quelle est votre préoccupation beauté prioritaire ?',
            'subtitle' => null,
            'question_type' => QuestionType::SingleChoice,
            'sort_order' => 2,
        ], [
            ['value_code' => 'taches', 'label' => 'Taches & hyperpigmentation', 'description' => 'Unifier le grain de peau', 'glyph' => '◐'],
            ['value_code' => 'eclat', 'label' => 'Manque d’éclat', 'description' => 'Réveiller la luminosité', 'glyph' => '☼'],
            ['value_code' => 'hydratation', 'label' => 'Peau sèche, déshydratée', 'description' => 'Restaurer le confort', 'glyph' => '◌'],
            ['value_code' => 'unification', 'label' => 'Teint irrégulier', 'description' => 'Harmoniser la carnation', 'glyph' => '◯'],
            ['value_code' => 'antiage', 'label' => 'Anti-âge, fermeté', 'description' => 'Lisser & raffermir', 'glyph' => '❋'],
        ]);

        $this->question('routine', [
            'title' => 'Quelle routine souhaitez-vous ?',
            'subtitle' => null,
            'question_type' => QuestionType::SingleChoice,
            'sort_order' => 3,
        ], [
            ['value_code' => 'simple', 'label' => 'Routine essentielle', 'description' => '1 à 2 produits — geste minimaliste', 'glyph' => '◇'],
            ['value_code' => 'complete', 'label' => 'Routine complète', 'description' => '3 à 5 produits — rituel quotidien', 'glyph' => '◆'],
            ['value_code' => 'intensive', 'label' => 'Programme intensif', 'description' => '6 produits & plus — soin sur-mesure', 'glyph' => '✧'],
        ]);

        $products = Product::query()->whereNull('parent_id')->orderBy('id')->limit(5)->get();

        foreach ($products as $index => $product) {
            $concern = match ($index) {
                0 => 'taches',
                1 => 'eclat',
                2 => 'hydratation',
                3 => 'unification',
                default => 'antiage',
            };

            Rule::query()->updateOrCreate(
                [
                    'product_id' => $product->id,
                    'tier' => QuizTier::Essential,
                ],
                [
                    'conditions' => ['skin_concern' => $concern],
                    'priority' => 10 - $index,
                    'archived_at' => null,
                ],
            );
        }
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @param  list<array{value_code: string, label: string, description: ?string, glyph: string}>  $options
     */
    private function question(string $slug, array $attributes, array $options): Question
    {
        $question = Question::query()->updateOrCreate(
            ['slug' => $slug],
            $attributes,
        );

        $question->syncOptions($options);

        return $question;
    }
}
