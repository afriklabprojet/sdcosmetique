<?php

declare(strict_types=1);

namespace App\Modules\Pos\Models;

use App\Modules\Identity\Models\Admin;
use App\Modules\Orders\Models\Order;
use App\Shared\Casts\Money as MoneyCast;
use Database\Factories\Pos\RefundFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Un remboursement de vente caisse — total ou partiel. Une commande peut
 * avoir plusieurs `Refund` successifs (ex. deux remboursements partiels),
 * jamais un état binaire unique : `Order::refunded_at` (généraliste, déjà
 * éprouvé par le flux web) n'est posé qu'une fois le remboursé cumulé égal
 * au total de la commande — voir `PosRefund::refund()`.
 */
#[Table('pos_refunds')]
#[Fillable(['order_id', 'admin_id', 'amount', 'method', 'reason', 'created_at'])]
class Refund extends Model
{
    /** @use HasFactory<RefundFactory> */
    use HasFactory;

    public $timestamps = false;

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<Admin, $this>
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }

    /**
     * @return HasMany<Refund\Item, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(Refund\Item::class, 'pos_refund_id');
    }

    protected static function newFactory(): RefundFactory
    {
        return RefundFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => MoneyCast::class,
            'created_at' => 'datetime',
        ];
    }
}
