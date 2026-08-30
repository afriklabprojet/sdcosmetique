<?php

declare(strict_types=1);

namespace App\Shared\Translations;

use Database\Factories\Shared\TranslationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Table('translations')]
#[Fillable(['locale', 'field', 'value'])]
class Translation extends Model
{
    /** @use HasFactory<TranslationFactory> */
    use HasFactory;

    /**
     * @return MorphTo<Model, $this>
     */
    public function translatable(): MorphTo
    {
        return $this->morphTo();
    }

    protected static function newFactory(): TranslationFactory
    {
        return TranslationFactory::new();
    }
}
