<?php

declare(strict_types=1);

namespace App\Modules\Identity\Models;

use App\Models\User;
use Database\Factories\Identity\LoginOtpFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('login_otps')]
#[Fillable(['user_id', 'code_hash', 'expires_at', 'used_at'])]
class LoginOtp extends Model
{
    /** @use HasFactory<LoginOtpFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function expired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function used(): bool
    {
        return $this->used_at !== null;
    }

    public function usable(): bool
    {
        return ! $this->used() && ! $this->expired();
    }

    public function consume(): void
    {
        $this->forceFill(['used_at' => now()])->save();
    }

    protected static function newFactory(): LoginOtpFactory
    {
        return LoginOtpFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
        ];
    }
}
