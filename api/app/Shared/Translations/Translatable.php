<?php

declare(strict_types=1);

namespace App\Shared\Translations;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
final class Translatable
{
    /**
     * @param  array<int, string>  $fields
     */
    public function __construct(public array $fields) {}
}
