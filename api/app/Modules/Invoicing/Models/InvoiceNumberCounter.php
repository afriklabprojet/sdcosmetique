<?php

declare(strict_types=1);

namespace App\Modules\Invoicing\Models;

use Database\Factories\Invoicing\InvoiceNumberCounterFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Table('invoice_number_counters')]
#[Fillable(['year', 'last_number'])]
class InvoiceNumberCounter extends Model
{
    /** @use HasFactory<InvoiceNumberCounterFactory> */
    use HasFactory;

    public $incrementing = false;

    public $timestamps = false;

    protected $primaryKey = 'year';

    protected $keyType = 'int';

    protected static function newFactory(): InvoiceNumberCounterFactory
    {
        return InvoiceNumberCounterFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'last_number' => 'integer',
        ];
    }
}
