<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Database\Factories\Catalog\ToneFactory;

#[Table('skin_tones')]
#[Fillable(['slug', 'label'])]
class Tone extends Model
{
    /** @use HasFactory<ToneFactory> */
    use HasFactory;

    protected static function newFactory(): ToneFactory
    {
        return ToneFactory::new();
    }
}
