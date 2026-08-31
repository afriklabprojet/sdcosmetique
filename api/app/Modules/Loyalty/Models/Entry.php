<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Models;

use App\Modules\Loyalty\Enums\LoyaltyReason;
use Database\Factories\Loyalty\EntryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('loyalty_ledger')]
#[Fillable([
    'account_id',
    'points_delta',
    'balance_after',
    'reason',
    'reference_type',
    'reference_id',
    'description',
    'created_at',
])]
class Entry extends Model
{
    /** @use HasFactory<EntryFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    /**
     * @return BelongsTo<Account, $this>
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    protected static function newFactory(): EntryFactory
    {
        return EntryFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'points_delta' => 'integer',
            'balance_after' => 'integer',
            'reason' => LoyaltyReason::class,
            'created_at' => 'datetime',
        ];
    }
}
