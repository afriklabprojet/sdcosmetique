<?php

declare(strict_types=1);

namespace App\Modules\Leads\Models\Contact;

use Database\Factories\Leads\ContactMessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Table('contact_messages')]
#[Fillable(['name', 'email', 'subject', 'message', 'handled_at'])]
class Message extends Model
{
    /** @use HasFactory<ContactMessageFactory> */
    use HasFactory;

    public function resolve(): void
    {
        $this->forceFill(['handled_at' => now()])->save();
    }

    public function open(): bool
    {
        return $this->handled_at === null;
    }

    protected static function newFactory(): ContactMessageFactory
    {
        return ContactMessageFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'handled_at' => 'datetime',
        ];
    }
}
