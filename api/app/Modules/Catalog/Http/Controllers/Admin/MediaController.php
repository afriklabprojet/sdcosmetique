<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Catalog\Http\Requests\Admin\StoreMediaRequest;
use App\Modules\Catalog\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function store(StoreMediaRequest $request): JsonResponse
    {
        $product = Product::query()->findOrFail($request->integer('product_id'));

        $this->authorize('update', $product);

        $upload = $request->file('file');
        $path = $upload->store('products', 'public');

        $file = $product->files()->create([
            'disk' => 'public',
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
            'mime_type' => $upload->getClientMimeType(),
            'size' => $upload->getSize(),
        ]);

        return response()->json([
            'data' => [
                'id' => $file->id,
                'url' => $file->url,
            ],
        ], Response::HTTP_CREATED);
    }
}
