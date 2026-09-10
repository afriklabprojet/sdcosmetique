<?php

declare(strict_types=1);

namespace App\Modules\Orders\Models;

use Database\Factories\Orders\OrderNumberCounterFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Table('order_number_counters')]
#[Fillable(['year', 'last_number'])]
class OrderNumberCounter extends Model
{
    /** @use HasFactory<OrderNumberCounterFactory> */
    use HasFactory;

    public $incrementing = false;

    public $timestamps = false;

    protected $primaryKey = 'year';

    protected $keyType = 'int';

    protected static function newFactory(): OrderNumberCounterFactory
    {
        return OrderNumberCounterFactory::new();
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
