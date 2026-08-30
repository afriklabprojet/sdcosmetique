<?php

declare(strict_types=1);

namespace App\Modules\Identity\Models;

use App\Models\User;
use Database\Factories\Identity\AdminFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('admins')]
#[Fillable(['user_id', 'role', 'root_at', 'revoked_at'])]
class Admin extends Model
{
    /** @use HasFactory<AdminFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function revoke(): void
    {
        $this->forceFill(['revoked_at' => now()])->save();
    }

    public function active(): bool
    {
        return $this->revoked_at === null;
    }

    public function root(): bool
    {
        return $this->root_at !== null;
    }

    protected static function newFactory(): AdminFactory
    {
        return AdminFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'root_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }
}
