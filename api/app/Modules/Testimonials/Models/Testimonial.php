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
/**
 * Témoignage de marque, sans produit ni note — affiché sur /avis et
 * l'accueil. À distinguer de App\Modules\Reviews\Models\Review : ce dernier
 * est un avis noté (1-5 étoiles) rattaché à un produit précis, qui alimente
 * la note moyenne et le JSON-LD AggregateRating de la fiche produit.
 */
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
