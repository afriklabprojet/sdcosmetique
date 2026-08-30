<?php

declare(strict_types=1);

namespace App\Shared\Translations;

use Illuminate\Database\Eloquent\Relations\MorphMany;
use ReflectionClass;

trait HasTranslations
{
    /**
     * @return MorphMany<Translation, $this>
     */
    public function translations(): MorphMany
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    /**
     * @return array<int, string>
     */
    public function translatableFields(): array
    {
        $attributes = (new ReflectionClass($this))->getAttributes(Translatable::class);

        if ($attributes === []) {
            return [];
        }

        return $attributes[0]->newInstance()->fields;
    }

    public function translate(string $field, ?string $locale = null): ?string
    {
        $locale ??= app()->getLocale();
        $fallback = (string) config('app.fallback_locale', 'en');

        if ($locale !== $fallback) {
            $row = $this->translations
                ->first(fn (Translation $translation): bool => $translation->locale === $locale && $translation->field === $field);

            if ($row !== null) {
                return $row->value;
            }
        }

        $value = $this->getAttributeFromArray($field);

        return $value === null ? null : (string) $value;
    }

    public function getAttribute(mixed $key): mixed
    {
        if (is_string($key) && in_array($key, $this->translatableFields(), true)) {
            return $this->translate($key);
        }

        return parent::getAttribute($key);
    }
}
