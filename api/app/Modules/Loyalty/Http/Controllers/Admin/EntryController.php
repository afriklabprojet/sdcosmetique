<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Loyalty\Http\Resources\Admin\EntryResource;
use App\Modules\Loyalty\Models\Entry;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EntryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Entry::class);

        return EntryResource::collection(
            Entry::query()->with('account')->latest('id')->get(),
        );
    }
}
