<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Quiz\Http\Resources\QuestionResource;
use App\Modules\Quiz\Models\Question;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class QuestionController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Question::class);

        return QuestionResource::collection(
            Question::query()
                ->whereNull('archived_at')
                ->with(['options' => fn ($query) => $query->whereNull('archived_at')->orderBy('sort_order')])
                ->orderBy('sort_order')
                ->get(),
        );
    }
}
