<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Models;

use App\Modules\Accounts\Models\Client;
use App\Modules\Loyalty\Enums\LoyaltyReason;
use App\Modules\Loyalty\Enums\LoyaltyTier;
use Database\Factories\Loyalty\AccountFactory;
use DomainException;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

#[Table('loyalty_accounts')]
#[Fillable(['client_id', 'current_points', 'lifetime_points', 'tier', 'tier_at'])]
class Account extends Model
{
    /** @use HasFactory<AccountFactory> */
    use HasFactory;

    public static function for(Client $client): self
    {
        return self::query()->firstOrCreate(
            ['client_id' => $client->id],
            [
                'current_points' => 0,
                'lifetime_points' => 0,
                'tier' => LoyaltyTier::Bronze,
                'tier_at' => now(),
            ],
        );
    }

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return HasMany<Entry, $this>
     */
    public function entries(): HasMany
    {
        return $this->hasMany(Entry::class, 'account_id')->latest('id');
    }

    public function credit(
        int $delta,
        LoyaltyReason $reason,
        ?string $description = null,
        ?string $referenceType = null,
        ?string $referenceId = null,
    ): Entry {
        if ($delta === 0) {
            throw new DomainException('A ledger delta cannot be zero.');
        }

        return DB::transaction(function () use ($delta, $reason, $description, $referenceType, $referenceId): Entry {
            $account = self::query()->whereKey($this->id)->lockForUpdate()->firstOrFail();
            $balance = $account->current_points + $delta;

            if ($balance < 0) {
                throw new DomainException('Loyalty balance cannot go negative.');
            }

            $account->forceFill([
                'current_points' => $balance,
                'lifetime_points' => $account->lifetime_points + max($delta, 0),
            ])->save();

            $entry = $account->entries()->create([
                'points_delta' => $delta,
                'balance_after' => $balance,
                'reason' => $reason,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'description' => $description,
                'created_at' => now(),
            ]);

            $this->refresh();

            return $entry;
        });
    }

    protected static function newFactory(): AccountFactory
    {
        return AccountFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_points' => 'integer',
            'lifetime_points' => 'integer',
            'tier' => LoyaltyTier::class,
            'tier_at' => 'datetime',
        ];
    }
}
