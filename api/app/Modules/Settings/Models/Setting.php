<?php

declare(strict_types=1);

namespace App\Modules\Settings\Models;

use Database\Factories\Settings\SettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Table('settings')]
#[Fillable(['key', 'value', 'is_public'])]
class Setting extends Model
{
    /** @use HasFactory<SettingFactory> */
    use HasFactory;

    public $incrementing = false;

    public $timestamps = false;

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public function getRouteKeyName(): string
    {
        return 'key';
    }

    public function public(): bool
    {
        return (bool) $this->is_public;
    }

    protected static function newFactory(): SettingFactory
    {
        return SettingFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'json',
            'is_public' => 'boolean',
            'updated_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (self $setting): void {
            $setting->updated_at = now();
        });
    }
}
