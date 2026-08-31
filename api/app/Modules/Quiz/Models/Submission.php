<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Models;

use App\Modules\Accounts\Models\Client;
use App\Modules\Catalog\Models\Product;
use Database\Factories\Quiz\SubmissionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('quiz_submissions')]
#[Fillable(['client_id', 'email', 'first_name', 'phone', 'completed_at'])]
class Submission extends Model
{
    /** @use HasFactory<SubmissionFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return HasMany<Answer, $this>
     */
    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class, 'submission_id');
    }

    /**
     * @return array<string, string>
     */
    public function answerMap(): array
    {
        $this->loadMissing('answers.question', 'answers.option');

        $map = [];
        foreach ($this->answers as $answer) {
            $map[$answer->question->slug] = $answer->option->value_code;
        }

        return $map;
    }

    /**
     * @return Collection<int, Product>
     */
    public function recommendations(): Collection
    {
        $matched = Rule::query()
            ->whereNull('archived_at')
            ->with('product')
            ->orderByDesc('priority')
            ->get()
            ->filter(fn (Rule $rule): bool => $rule->matches($this));

        return $matched
            ->map(fn (Rule $rule): ?Product => $rule->product)
            ->filter()
            ->unique('id')
            ->values();
    }

    protected static function newFactory(): SubmissionFactory
    {
        return SubmissionFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }
}
