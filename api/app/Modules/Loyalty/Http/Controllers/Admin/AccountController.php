<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Loyalty\Http\Resources\Admin\AccountResource;
use App\Modules\Loyalty\Models\Account;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AccountController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Account::class);

        return AccountResource::collection(
            Account::query()->with('client.user')->latest()->get(),
        );
    }
}
