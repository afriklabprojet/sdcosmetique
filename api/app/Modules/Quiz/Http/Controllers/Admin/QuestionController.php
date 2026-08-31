<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Quiz\Http\Requests\Admin\QuestionRequest;
use App\Modules\Quiz\Http\Resources\Admin\QuestionResource;
use App\Modules\Quiz\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class QuestionController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Question::class);

        return QuestionResource::collection(
            Question::query()->with('options')->orderBy('sort_order')->get(),
        );
    }

    public function store(QuestionRequest $request): JsonResponse
    {
        $this->authorize('create', Question::class);

        $question = Question::query()->create($this->payload($request));

        if ($request->exists('options')) {
            $question->syncOptions($request->validated('options', []));
        }

        return QuestionResource::make($question->load('options'))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Question $question): JsonResponse
    {
        $this->authorize('view', $question);

        return QuestionResource::make($question->load('options'))->response();
    }

    public function update(QuestionRequest $request, Question $question): JsonResponse
    {
        $this->authorize('update', $question);

        $question->fill($this->payload($request))->save();

        if ($request->exists('options')) {
            $question->syncOptions($request->validated('options', []));
        }

        return QuestionResource::make($question->refresh()->load('options'))->response();
    }

    public function destroy(Question $question): Response
    {
        $this->authorize('delete', $question);

        $question->delete();

        return response()->noContent();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(QuestionRequest $request): array
    {
        $data = $request->safe()->except(['options', 'archived']);

        if ($request->exists('archived')) {
            $data['archived_at'] = $request->boolean('archived') ? now() : null;
        }

        return $data;
    }
}
