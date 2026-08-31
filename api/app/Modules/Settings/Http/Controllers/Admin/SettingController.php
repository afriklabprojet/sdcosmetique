<?php

declare(strict_types=1);

namespace App\Modules\Settings\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Http\Requests\Admin\SettingRequest;
use App\Modules\Settings\Http\Resources\Admin\SettingResource;
use App\Modules\Settings\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SettingController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Setting::class);

        return SettingResource::collection(
            Setting::query()->orderBy('key')->get(),
        );
    }

    public function show(Setting $setting): JsonResponse
    {
        $this->authorize('view', $setting);

        return SettingResource::make($setting)->response();
    }

    public function update(SettingRequest $request, Setting $setting): JsonResponse
    {
        $this->authorize('update', $setting);

        $setting->fill($request->validated())->save();

        return SettingResource::make($setting->refresh())->response();
    }
}
