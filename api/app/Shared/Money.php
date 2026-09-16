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

    /**
     * "15 000 FCFA" — jamais "15000FCFA". Espace insécable comme séparateur
     * de milliers pour qu'il ne se coupe jamais en fin de ligne (PDF, ticket).
     * Seule XOF est utilisée dans ce projet (§24) ; les autres devises
     * retombent sur ce même format plutôt que d'échouer.
     */
    public function format(): string
    {
        $suffix = match ($this->currency) {
            'XOF' => 'FCFA',
            default => $this->currency,
        };

        return number_format($this->value, 0, ',', "\u{00A0}").' '.$suffix;
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
