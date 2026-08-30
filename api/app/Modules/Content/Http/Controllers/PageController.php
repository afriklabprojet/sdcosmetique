<?php

declare(strict_types=1);

namespace App\Modules\Content\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Content\Http\Resources\PageResource;
use App\Modules\Content\Models\Page;
use Illuminate\Http\JsonResponse;

class PageController extends Controller
{
    public function show(Page $page): JsonResponse
    {
        if (! $page->published()) {
            abort(404);
        }

        return (new PageResource($page))->response();
    }
}
