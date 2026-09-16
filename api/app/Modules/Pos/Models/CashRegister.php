<?php

declare(strict_types=1);

namespace App\Modules\Pos\Models;

use Database\Factories\Pos\CashRegisterFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('cash_registers')]
#[Fillable(['name', 'location', 'active'])]
class CashRegister extends Model
{
    /** @use HasFactory<CashRegisterFactory> */
    use HasFactory;

    /**
     * @return HasMany<CashRegisterSession, $this>
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(CashRegisterSession::class);
    }

    public function currentSession(): ?CashRegisterSession
    {
        return $this->sessions()->where('status', 'open')->latest('opened_at')->first();
    }

    protected static function newFactory(): CashRegisterFactory
    {
        return CashRegisterFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }
}
