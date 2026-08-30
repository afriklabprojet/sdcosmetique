<?php

declare(strict_types=1);

namespace App\Modules\Content\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Content\Http\Requests\Admin\BannerRequest;
use App\Modules\Content\Http\Resources\Admin\BannerResource;
use App\Modules\Content\Models\Banner;
use App\Shared\Translations\TranslationSync;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class BannerController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Banner::class);

        $banners = Banner::query()->with('translations')->orderBy('order')->get();

        return BannerResource::collection($banners)->response();
    }

    public function store(BannerRequest $request): JsonResponse
    {
        $this->authorize('create', Banner::class);

        $banner = Banner::create($request->safe()->except('translations'));

        TranslationSync::apply($banner, $request->validated('translations', []));

        return BannerResource::make($banner->load('translations'))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Banner $banner): JsonResponse
    {
        $this->authorize('view', $banner);

        return BannerResource::make($banner->load('translations'))->response();
    }

    public function update(BannerRequest $request, Banner $banner): JsonResponse
    {
        $this->authorize('update', $banner);

        $banner->update($request->safe()->except('translations'));

        TranslationSync::apply($banner, $request->validated('translations', []));

        return BannerResource::make($banner->load('translations'))->response();
    }

    public function destroy(Banner $banner): Response
    {
        $this->authorize('delete', $banner);

        $banner->delete();

        return response()->noContent();
    }
}
