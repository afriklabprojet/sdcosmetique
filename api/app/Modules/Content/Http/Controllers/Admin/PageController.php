<?php

declare(strict_types=1);

namespace App\Modules\Content\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Content\Http\Requests\Admin\PageRequest;
use App\Modules\Content\Http\Resources\Admin\PageResource;
use App\Modules\Content\Models\Page;
use App\Shared\Translations\TranslationSync;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class PageController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Page::class);

        $pages = Page::query()->with('translations')->orderBy('slug')->get();

        return PageResource::collection($pages)->response();
    }

    public function store(PageRequest $request): JsonResponse
    {
        $this->authorize('create', Page::class);

        $page = Page::create($request->safe()->except('translations'));

        TranslationSync::apply($page, $request->validated('translations', []));

        return PageResource::make($page->load('translations'))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Page $page): JsonResponse
    {
        $this->authorize('view', $page);

        return PageResource::make($page->load('translations'))->response();
    }

    public function update(PageRequest $request, Page $page): JsonResponse
    {
        $this->authorize('update', $page);

        $page->update($request->safe()->except('translations'));

        TranslationSync::apply($page, $request->validated('translations', []));

        return PageResource::make($page->load('translations'))->response();
    }

    public function destroy(Page $page): Response
    {
        $this->authorize('delete', $page);

        $page->delete();

        return response()->noContent();
    }
}
