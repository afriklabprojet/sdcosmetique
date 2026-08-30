<?php

declare(strict_types=1);

namespace Database\Factories\Catalog;

use App\Modules\Catalog\Models\File;
use App\Modules\Catalog\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<File>
 */
class FileFactory extends Factory
{
    protected $model = File::class;

    public function definition(): array
    {
        $path = '/assets/images/product/square/product-1.jpg';

        return [
            'fileable_type' => Product::class,
            'fileable_id' => Product::factory(),
            'disk' => 'public',
            'path' => $path,
            'url' => $path,
            'mime_type' => 'image/jpeg',
            'size' => 1024,
        ];
    }
}
