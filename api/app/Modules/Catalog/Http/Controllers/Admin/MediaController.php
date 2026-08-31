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
        $upload = $request->file('file');
        $folder = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $request->input('folder', 'uploads')) ?: 'uploads';
        $path = $upload->store($folder, 'public');
        $url = Storage::disk('public')->url($path);

        if ($request->filled('product_id')) {
            $product = Product::query()->findOrFail($request->integer('product_id'));
            $this->authorize('update', $product);

            $file = $product->files()->create([
                'disk' => 'public',
                'path' => $path,
                'url' => $url,
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

        return response()->json([
            'data' => [
                'url' => $url,
            ],
        ], Response::HTTP_CREATED);
    }
}
