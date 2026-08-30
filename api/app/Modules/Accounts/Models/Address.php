<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Models;

use Database\Factories\Accounts\AddressFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('addresses')]
#[Fillable([
    'client_id',
    'first_name',
    'last_name',
    'company',
    'line_1',
    'line_2',
    'city',
    'postal_code',
    'country',
    'phone',
])]
class Address extends Model
{
    /** @use HasFactory<AddressFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function snapshot(): array
    {
        return [
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'company' => $this->company,
            'line_1' => $this->line_1,
            'line_2' => $this->line_2,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'phone' => $this->phone,
        ];
    }

    protected static function newFactory(): AddressFactory
    {
        return AddressFactory::new();
    }
}
