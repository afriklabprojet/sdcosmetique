<?php

declare(strict_types=1);

namespace App\Modules\Settings\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Http\Requests\Admin\SettingRequest;
use App\Modules\Settings\Http\Resources\Admin\SettingResource;
use App\Modules\Settings\Models\Setting;
use App\Shared\Html\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SettingController extends Controller
{
    /**
     * `Setting.value` est un blob JSON générique sans forme fixe — on ne
     * peut donc pas désinfecter tout le monde sans risquer de casser des
     * réglages non-HTML (tableaux d'URLs, nombres, etc.). Cette allowlist
     * ne vise que les champs qu'on sait être du HTML riche affiché tel quel
     * (`dangerouslySetInnerHTML`) sur le site public — audit sécurité.
     *
     * @var array<string, list<string>>
     */
    private const array HTML_FIELDS = [
        'legal_mentions' => ['bodyHtml'],
        'legal_cgv' => ['bodyHtml'],
        'legal_confidentialite' => ['bodyHtml'],
        'legal_engagements' => ['bodyHtml'],
    ];

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

        $data = $request->validated();

        foreach (self::HTML_FIELDS[$setting->key] ?? [] as $field) {
            if (isset($data['value'][$field]) && is_string($data['value'][$field])) {
                $data['value'][$field] = HtmlSanitizer::clean($data['value'][$field]);
            }
        }

        $setting->fill($data)->save();

        return SettingResource::make($setting->refresh())->response();
    }
}
