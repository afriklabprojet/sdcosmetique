<?php

declare(strict_types=1);

namespace App\Modules\Invoicing\Models;

use App\Modules\Orders\Models\Order;
use Database\Factories\Invoicing\InvoiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

#[Table('invoices')]
#[Fillable(['order_id', 'number', 'issued_at', 'email_status', 'email_sent_at', 'email_error'])]
class Invoice extends Model
{
    /** @use HasFactory<InvoiceFactory> */
    use HasFactory;

    public const string STATUS_NOT_SENT = 'not_sent';

    public const string STATUS_PENDING = 'pending';

    public const string STATUS_SENT = 'sent';

    public const string STATUS_FAILED = 'failed';

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Récupère la facture d'une commande, ou en crée une avec un numéro
     * définitif à la première consultation. Le numéro, une fois attribué,
     * n'est plus jamais modifié — c'est cette méthode, et elle seule, qui en
     * attribue un (jamais de régénération ailleurs dans le code).
     */
    public static function forOrder(Order $order): self
    {
        $existing = self::query()->where('order_id', $order->id)->first();

        if ($existing !== null) {
            return $existing;
        }

        // `order_id` est unique en base : si deux requêtes tombent ici en
        // même temps pour la même commande neuve, `createOrFirst` absorbe la
        // violation d'unicité côté perdant et relit la ligne déjà créée par
        // le gagnant plutôt que de planter ou dupliquer une facture.
        return self::query()->createOrFirst(['order_id' => $order->id], [
            'number' => self::nextNumber(),
            'issued_at' => now(),
            'email_status' => self::STATUS_NOT_SENT,
        ]);
    }

    private static function nextNumber(): string
    {
        $year = (int) now()->year;

        // `createOrFirst` est la seule des deux méthodes Eloquent sûre contre
        // une création concurrente (elle absorbe la violation d'unicité si
        // une autre requête vient de créer la même ligne) — indispensable ici
        // puisque `year` est la clé primaire.
        InvoiceNumberCounter::query()->createOrFirst(['year' => $year], ['last_number' => 0]);

        // `lockForUpdate` ne protège la lecture-puis-écriture que dans une
        // transaction explicite : sans elle, MySQL relâche le verrou dès la
        // fin du SELECT et deux requêtes concurrentes pourraient lire le même
        // `last_number` avant de l'incrémenter chacune de leur côté.
        $next = DB::transaction(function () use ($year): int {
            $counter = InvoiceNumberCounter::query()->where('year', $year)->lockForUpdate()->first();
            $next = $counter->last_number + 1;
            $counter->update(['last_number' => $next]);

            return $next;
        });

        return sprintf('SDC-%d-%06d', $year, $next);
    }

    protected static function newFactory(): InvoiceFactory
    {
        return InvoiceFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'email_sent_at' => 'datetime',
        ];
    }
}
