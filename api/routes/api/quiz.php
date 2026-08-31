<?php

declare(strict_types=1);

use App\Modules\Quiz\Http\Controllers\QuestionController;
use App\Modules\Quiz\Http\Controllers\SubmissionController;
use Illuminate\Support\Facades\Route;

Route::get('quiz-questions', [QuestionController::class, 'index'])->name('quiz-questions.index');
Route::post('quiz-submissions', [SubmissionController::class, 'store'])->name('quiz-submissions.store');
Route::get('quiz-submissions/{submission}', [SubmissionController::class, 'show'])->name('quiz-submissions.show');
