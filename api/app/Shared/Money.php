<?php

declare(strict_types=1);

namespace App\Shared;

use InvalidArgumentException;
use Stringable;

final readonly class Money implements Stringable
{
    public function __construct(
        public int $value,
        public string $currency = 'XOF',
    ) {
        if ($value < 0) {
            throw new InvalidArgumentException('Money value must be unsigned.');
        }
    }

    public function __toString(): string
    {
        return (string) $this->value;
    }

    public function add(self $other): self
    {
        $this->assertSameCurrency($other);

        return new self($this->value + $other->value, $this->currency);
    }

    public function subtract(self $other): self
    {
        $this->assertSameCurrency($other);

        if ($other->value > $this->value) {
            throw new InvalidArgumentException('Money subtraction must not go negative.');
        }

        return new self($this->value - $other->value, $this->currency);
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value && $this->currency === $other->currency;
    }

    private function assertSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException('Money currencies must match.');
        }
    }
}
