<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Models;

use Database\Factories\Loyalty\WebhookLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Table('loyalty_webhook_logs')]
#[Fillable([
    'reference',
    'payload',
    'headers',
    'status',
    'failure_reason',
    'processed_at',
])]
class WebhookLog extends Model
{
    /** @use HasFactory<WebhookLogFactory> */
    use HasFactory;

    public function done(): bool
    {
        return $this->processed_at !== null;
    }

    public function fail(string $reason): void
    {
        $this->forceFill([
            'status' => 'rejected',
            'failure_reason' => $reason,
        ])->save();
    }

    public function settle(): void
    {
        $this->forceFill([
            'status' => 'settled',
            'failure_reason' => null,
            'processed_at' => now(),
        ])->save();
    }

    public function record(string $reason): void
    {
        $this->forceFill([
            'status' => 'recorded',
            'failure_reason' => $reason,
            'processed_at' => now(),
        ])->save();
    }

    protected static function newFactory(): WebhookLogFactory
    {
        return WebhookLogFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'headers' => 'array',
            'processed_at' => 'datetime',
        ];
    }
}
