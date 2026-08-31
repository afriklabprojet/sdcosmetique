<?php

declare(strict_types=1);

namespace App\Modules\Settings\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Http\Resources\SettingResource;
use App\Modules\Settings\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SettingController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Setting::class);

        return SettingResource::collection(
            Setting::query()->where('is_public', true)->orderBy('key')->get(),
        );
    }

    public function show(string $setting): JsonResponse
    {
        $row = Setting::query()->where('key', $setting)->where('is_public', true)->firstOrFail();

        $this->authorize('view', $row);

        return SettingResource::make($row)->response();
    }
}
