<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Models;

use Database\Factories\Catalog\FileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Table('files')]
#[Fillable(['disk', 'path', 'url', 'mime_type', 'size'])]
class File extends Model
{
    /** @use HasFactory<FileFactory> */
    use HasFactory;

    /**
     * @return MorphTo<Model, $this>
     */
    public function fileable(): MorphTo
    {
        return $this->morphTo();
    }

    protected static function newFactory(): FileFactory
    {
        return FileFactory::new();
    }
}
