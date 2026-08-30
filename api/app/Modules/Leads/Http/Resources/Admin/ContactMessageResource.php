<?php

declare(strict_types=1);

namespace App\Modules\Leads\Http\Resources\Admin;

use App\Modules\Leads\Models\Contact\Message;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Message
 */
class ContactMessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'subject' => $this->subject,
            'message' => $this->message,
            'handled_at' => $this->handled_at,
            'open' => $this->open(),
            'created_at' => $this->created_at,
        ];
    }
}
