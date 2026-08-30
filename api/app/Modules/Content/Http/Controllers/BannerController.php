<?php

declare(strict_types=1);

namespace App\Modules\Content\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Content\Http\Resources\BannerResource;
use App\Modules\Content\Models\Banner;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BannerController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        $banners = Banner::query()
            ->whereNotNull('visible_at')
            ->where('visible_at', '<=', now())
            ->orderBy('order')
            ->get();

        return BannerResource::collection($banners);
    }
}
