<?php

declare(strict_types=1);

namespace App\Modules\Testimonials\Models;

use Database\Factories\Testimonials\TestimonialFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Table('testimonials')]
#[Fillable(['name', 'text', 'avatar_url', 'approved_at'])]
class Testimonial extends Model
{
    /** @use HasFactory<TestimonialFactory> */
    use HasFactory;

    public function approved(): bool
    {
        return $this->approved_at !== null;
    }

    public function approve(bool $approved = true): void
    {
        $this->forceFill(['approved_at' => $approved ? now() : null])->save();
    }

    protected static function newFactory(): TestimonialFactory
    {
        return TestimonialFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
        ];
    }
}
