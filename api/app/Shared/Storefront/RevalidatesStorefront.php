<?php

declare(strict_types=1);

namespace App\Shared\Storefront;

trait RevalidatesStorefront
{
    protected static function bootRevalidatesStorefront(): void
    {
        static::saved(static fn () => Revalidator::tags(static::storefrontCacheTags()));
        static::deleted(static fn () => Revalidator::tags(static::storefrontCacheTags()));
    }

    /**
     * @return list<string>
     */
    abstract protected static function storefrontCacheTags(): array;
}
