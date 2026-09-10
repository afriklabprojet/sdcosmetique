<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Models;

use App\Models\User;
use App\Modules\Accounts\Models\Client;
use Database\Factories\Messaging\CustomerMessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('customer_messages')]
#[Fillable(['client_id', 'sent_by_user_id', 'channel', 'subject', 'body', 'recipient_email', 'status', 'error', 'sent_at'])]
class CustomerMessage extends Model
{
    /** @use HasFactory<CustomerMessageFactory> */
    use HasFactory;

    public const string STATUS_PENDING = 'pending';

    public const string STATUS_SENT = 'sent';

    public const string STATUS_FAILED = 'failed';

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function sentBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by_user_id');
    }

    protected static function newFactory(): CustomerMessageFactory
    {
        return CustomerMessageFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
        ];
    }
}
