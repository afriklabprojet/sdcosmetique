<?php

declare(strict_types=1);

namespace App\Modules\Pos\Models;

use App\Modules\Identity\Models\Admin;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment\Attempt;
use App\Modules\Pos\Enums\PosTenderMethod;
use App\Shared\Casts\Money as MoneyCast;
use App\Shared\Money;
use Database\Factories\Pos\CashRegisterSessionFactory;
use DomainException;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

#[Table('cash_register_sessions')]
#[Fillable([
    'cash_register_id',
    'admin_id',
    'opening_balance',
    'expected_cash',
    'actual_cash',
    'difference',
    'status',
    'notes',
    'opened_at',
    'closed_at',
])]
class CashRegisterSession extends Model
{
    /** @use HasFactory<CashRegisterSessionFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<CashRegister, $this>
     */
    public function cashRegister(): BelongsTo
    {
        return $this->belongsTo(CashRegister::class);
    }

    /**
     * @return BelongsTo<Admin, $this>
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }

    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function open(): bool
    {
        return $this->status === 'open';
    }

    /**
     * Ouvre une session — une seule à la fois par caisse. Le verrou porte sur
     * la caisse elle-même (`lockForUpdate` sur la ligne `cash_registers`) pour
     * empêcher deux ouvertures concurrentes de passer toutes les deux le test
     * "aucune session ouverte" avant que l'une des deux n'écrive.
     */
    public static function openFor(CashRegister $register, Admin $admin, Money $openingBalance): self
    {
        return DB::transaction(function () use ($register, $admin, $openingBalance): self {
            CashRegister::query()->whereKey($register->id)->lockForUpdate()->first();

            if (self::query()->where('cash_register_id', $register->id)->where('status', 'open')->exists()) {
                throw new DomainException('Cette caisse a déjà une session ouverte.');
            }

            return self::query()->create([
                'cash_register_id' => $register->id,
                'admin_id' => $admin->id,
                'opening_balance' => $openingBalance->value,
                'status' => 'open',
                'opened_at' => now(),
            ]);
        });
    }

    /**
     * Ferme la session : calcule les espèces attendues (fond initial + total
     * des règlements espèces des ventes de cette session, moins les
     * remboursements rendus en espèces sur cette même session), compare au
     * montant compté par le vendeur, et enregistre l'écart. Ne restreint
     * jamais la fermeture même en cas d'écart — seul le montant est
     * enregistré pour l'audit, la décision d'agir dessus reste humaine.
     */
    public function close(Money $actualCash, ?string $notes = null): void
    {
        if (! $this->open()) {
            throw new DomainException('Cette session est déjà fermée.');
        }

        $expected = $this->opening_balance->value + $this->netTotalForMethod(PosTenderMethod::Cash);
        $difference = $actualCash->value - $expected;

        $this->forceFill([
            'expected_cash' => $expected,
            'actual_cash' => $actualCash->value,
            'difference' => $difference,
            'status' => 'closed',
            'notes' => $notes,
            'closed_at' => now(),
        ])->save();
    }

    /**
     * Récapitulatif d'encaissement NET de la session (ventes − remboursements
     * rendus par le même moyen), tous moyens de règlement confondus — utilisé
     * pour l'écran de fermeture et le dashboard caisse.
     *
     * @return array<string, int>
     */
    public function totalsByMethod(): array
    {
        $totals = [];

        foreach (PosTenderMethod::cases() as $method) {
            $totals[$method->value] = $this->netTotalForMethod($method);
        }

        return $totals;
    }

    private function salesForMethod(PosTenderMethod $method): int
    {
        return (int) Attempt::query()
            ->whereNotNull('confirmed_at')
            ->where('gateway', $method->gateway())
            ->whereIn('payment_id', function ($query): void {
                $query->select('payments.id')
                    ->from('payments')
                    ->join('orders', 'orders.id', '=', 'payments.order_id')
                    ->where('orders.cash_register_session_id', $this->id);
            })
            ->sum('amount');
    }

    private function refundsForMethod(PosTenderMethod $method): int
    {
        return (int) Refund::query()
            ->where('method', $method->value)
            ->whereIn('order_id', function ($query): void {
                $query->select('id')->from('orders')->where('cash_register_session_id', $this->id);
            })
            ->sum('amount');
    }

    private function netTotalForMethod(PosTenderMethod $method): int
    {
        return $this->salesForMethod($method) - $this->refundsForMethod($method);
    }

    protected static function newFactory(): CashRegisterSessionFactory
    {
        return CashRegisterSessionFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'opening_balance' => MoneyCast::class,
            'expected_cash' => MoneyCast::class,
            'actual_cash' => MoneyCast::class,
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }
}
