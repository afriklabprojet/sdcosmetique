<?php

declare(strict_types=1);

namespace App\Modules\Payments\Domain;

use InvalidArgumentException;

class Terminals
{
    /** @var array<string, class-string<Terminal>|Terminal> */
    private array $terminals = [];

    /**
     * @param array<string, class-string<Terminal>|Terminal> $terminals
     */
    public function __construct(array $terminals = [])
    {
        foreach ($terminals as $name => $terminal) {
            $this->register($name, $terminal);
        }
    }

    public function register(string $name, string|Terminal $terminal): self
    {
        $this->terminals[strtolower($name)] = $terminal;

        return $this;
    }

    public function has(string $name): bool
    {
        return isset($this->terminals[strtolower($name)]);
    }

    public function get(string $name): Terminal
    {
        $key = strtolower($name);

        if (! isset($this->terminals[$key])) {
            throw new InvalidArgumentException("Payment terminal [{$name}] is not registered.");
        }

        $resolved = $this->terminals[$key];

        if (is_string($resolved)) {
            $instance = app($resolved);

            if (! $instance instanceof Terminal) {
                throw new InvalidArgumentException("Payment terminal [{$name}] must implement " . Terminal::class);
            }

            return $instance;
        }

        return $resolved;
    }

    public function default(): Terminal
    {
        $driver = (string) config('payments.driver', 'null');

        return $this->has($driver) ? $this->get($driver) : $this->get('null');
    }

    /**
     * @return array<string>
     */
    public function names(): array
    {
        return array_keys($this->terminals);
    }
}
