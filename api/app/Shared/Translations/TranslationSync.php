<?php

declare(strict_types=1);

namespace App\Shared\Translations;

use Illuminate\Database\Eloquent\Model;

class TranslationSync
{
    /**
     * Persist a list of translation rows for a translatable model.
     *
     * Each entry is an array with `locale`, `field`, and `value` keys. Only
     * fields declared on the model's #[Translatable] attribute are stored;
     * a null value removes the row.
     *
     * @param  Model&HasTranslations|Model  $model
     * @param  array<int, array{locale: string, field: string, value: ?string}>  $translations
     */
    public static function apply(Model $model, array $translations): void
    {
        /** @var array<int, string> $allowed */
        $allowed = method_exists($model, 'translatableFields') ? $model->translatableFields() : [];

        foreach ($translations as $entry) {
            $field = $entry['field'] ?? null;
            $locale = $entry['locale'] ?? null;

            if ($field === null || $locale === null || ! in_array($field, $allowed, true)) {
                continue;
            }

            $value = $entry['value'] ?? null;

            if ($value === null || $value === '') {
                $model->translations()
                    ->where('locale', $locale)
                    ->where('field', $field)
                    ->delete();

                continue;
            }

            $model->translations()->updateOrCreate(
                ['locale' => $locale, 'field' => $field],
                ['value' => $value],
            );
        }
    }
}
