<?php

declare(strict_types=1);

it('returns a pong payload', function (): void {
    $this->getJson('/v1/ping')
        ->assertOk()
        ->assertJson(['pong' => true]);
});
