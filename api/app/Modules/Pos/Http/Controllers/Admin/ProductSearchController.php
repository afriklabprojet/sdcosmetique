<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Catalog\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Recherche produit dédiée à l'écran de caisse (§4-§5) : ne renvoie que les
 * produits réellement vendables (variante, ou produit autonome tarifé), jamais
 * un parent qui exige le choix d'une variante. Réutilise directement le modèle
 * `Product` existant — aucune duplication du catalogue.
 */
class ProductSearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $term = trim((string) $request->string('q'));

        $query = $this->sellableProducts()->with('parent:id,title');

        if ($term !== '') {
            // Le nom affiché au comptoir (`payload()` ci-dessous) vient du
            // parent quand l'enfant n'a pas son propre titre — la recherche
            // doit donc matcher les deux pour retrouver un produit par son
            // nom usuel, pas seulement par le titre (parfois vide/générique)
            // de la variante elle-même.
            $query->where(function ($builder) use ($term): void {
                $builder->where('title', 'like', "%{$term}%")
                    ->orWhere('sku', 'like', "%{$term}%")
                    ->orWhereHas('parent', fn ($parentQuery) => $parentQuery->where('title', 'like', "%{$term}%"));
            });
        }

        $products = $query->orderBy('title')->paginate(min((int) $request->integer('perPage', 24), 50));

        return response()->json([
            'data' => collect($products->items())->map(fn (Product $product): array => $this->payload($product))->values(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /** Scan code-barres physique (le scanner se comporte comme un clavier) — le SKU sert de code scannable, pas de colonne dédiée à dupliquer. */
    public function byBarcode(string $barcode): JsonResponse
    {
        $product = $this->sellableProducts()
            ->where('sku', $barcode)
            ->with('parent:id,title')
            ->first();

        if ($product === null) {
            return response()->json(['message' => 'Produit introuvable.'], 404);
        }

        return response()->json(['data' => $this->payload($product)]);
    }

    /** @return Builder<Product> */
    private function sellableProducts(): Builder
    {
        return Product::query()
            ->whereNotNull('regular_price')
            ->where(fn (Builder $query): Builder => $query
                ->whereNotNull('parent_id')
                ->orWhereDoesntHave('children'));
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Product $product): array
    {
        return [
            'id' => $product->id,
            'title' => $product->parent?->title ?? $product->title,
            'label' => $product->label,
            'sku' => $product->sku,
            'unit_price' => $product->pricing()->unit(),
            'stock' => $product->inventory()->effective(),
            'available' => $product->inventory()->available(),
        ];
    }
}
