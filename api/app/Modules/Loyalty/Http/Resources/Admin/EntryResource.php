<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Http\Resources\Admin;

use App\Modules\Loyalty\Http\Resources\EntryResource as PublicEntryResource;

class EntryResource extends PublicEntryResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $this->loadMissing('account');

        return array_merge(parent::toArray($request), [
            'account_id' => $this->account_id,
            'client_id' => $this->account?->client_id,
        ]);
    }
}
