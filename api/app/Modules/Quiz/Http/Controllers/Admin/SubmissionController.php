<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Quiz\Http\Resources\Admin\SubmissionResource;
use App\Modules\Quiz\Models\Submission;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SubmissionController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Submission::class);

        return SubmissionResource::collection(
            Submission::query()->with(['answers.question', 'answers.option'])->latest()->get(),
        );
    }
}
