<?php

declare(strict_types=1);

namespace App\Modules\Leads\Models\Newsletter;

use Database\Factories\Leads\NewsletterSubscriptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Table('newsletter_subscriptions')]
#[Fillable(['email', 'confirmed_at', 'unsubscribed_at'])]
class Subscription extends Model
{
    /** @use HasFactory<NewsletterSubscriptionFactory> */
    use HasFactory;

    public function confirm(): void
    {
        $this->forceFill(['confirmed_at' => now()])->save();
    }

    public function unsubscribe(): void
    {
        $this->forceFill(['unsubscribed_at' => now()])->save();
    }

    public function active(): bool
    {
        return $this->confirmed_at !== null && $this->unsubscribed_at === null;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'confirmed_at' => 'datetime',
            'unsubscribed_at' => 'datetime',
        ];
    }

    protected static function newFactory(): NewsletterSubscriptionFactory
    {
        return NewsletterSubscriptionFactory::new();
    }
}
