<?php

declare(strict_types=1);

namespace App\Modules\Pos\Models;

use App\Models\User;
use Database\Factories\Pos\AuditLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\Request;

/**
 * Journal d'audit des opérations sensibles de la caisse (§23) : ventes,
 * remboursements, remises, ouvertures/fermetures de session. Générique
 * (polymorphe) plutôt que spécifique à un seul type d'entité, pour pouvoir
 * tracer aussi bien une `Order` qu'une `CashRegisterSession` sans dupliquer
 * la table.
 */
#[Table('pos_audit_logs')]
#[Fillable(['user_id', 'action', 'auditable_type', 'auditable_id', 'old_values', 'new_values', 'ip_address'])]
class AuditLog extends Model
{
    /** @use HasFactory<AuditLogFactory> */
    use HasFactory;

    public const string SALE_CREATED = 'sale_created';

    public const string SALE_CANCELLED = 'sale_cancelled';

    public const string SALE_REFUNDED = 'sale_refunded';

    public const string DISCOUNT_APPLIED = 'discount_applied';

    public const string CASH_SESSION_OPENED = 'cash_session_opened';

    public const string CASH_SESSION_CLOSED = 'cash_session_closed';

    public const string PAYMENT_CREATED = 'payment_created';

    public $timestamps = false;

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @param  array<string, mixed>  $old_values
     * @param  array<string, mixed>  $new_values
     */
    public static function record(
        string $action,
        Model $auditable,
        ?User $user = null,
        array $old_values = [],
        array $new_values = [],
        ?Request $request = null,
    ): self {
        return self::query()->create([
            'user_id' => $user?->id,
            'action' => $action,
            'auditable_type' => $auditable::class,
            'auditable_id' => $auditable->getKey(),
            'old_values' => $old_values === [] ? null : $old_values,
            'new_values' => $new_values === [] ? null : $new_values,
            'ip_address' => $request?->ip(),
            'created_at' => now(),
        ]);
    }

    protected static function newFactory(): AuditLogFactory
    {
        return AuditLogFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
