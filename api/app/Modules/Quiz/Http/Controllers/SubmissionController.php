<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Quiz\Http\Requests\StoreSubmissionRequest;
use App\Modules\Quiz\Http\Resources\SubmissionResource;
use App\Modules\Quiz\Models\Option;
use App\Modules\Quiz\Models\Question;
use App\Modules\Quiz\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SubmissionController extends Controller
{
    public function store(StoreSubmissionRequest $request): JsonResponse
    {
        $this->authorize('create', Submission::class);

        $submission = DB::transaction(function () use ($request): Submission {
            $submission = Submission::query()->create([
                'client_id' => $request->user()?->client?->id,
                'email' => $request->input('email'),
                'first_name' => $request->input('first_name'),
                'phone' => $request->input('phone'),
                'completed_at' => now(),
            ]);

            foreach ($request->validated('answers') as $row) {
                $question = Question::query()
                    ->where('slug', $row['question'])
                    ->whereNull('archived_at')
                    ->first();

                if ($question === null) {
                    throw ValidationException::withMessages([
                        'answers' => 'Unknown or archived question: '.$row['question'],
                    ]);
                }

                $option = Option::query()
                    ->where('question_id', $question->id)
                    ->where('value_code', $row['option'])
                    ->whereNull('archived_at')
                    ->first();

                if ($option === null) {
                    throw ValidationException::withMessages([
                        'answers' => 'Unknown or archived option: '.$row['option'],
                    ]);
                }

                $submission->answers()->create([
                    'question_id' => $question->id,
                    'option_id' => $option->id,
                ]);
            }

            return $submission;
        });

        return SubmissionResource::make($submission->load(['answers.question', 'answers.option']))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Submission $submission): JsonResponse
    {
        $this->authorize('view', $submission);

        return SubmissionResource::make($submission)->response();
    }
}
