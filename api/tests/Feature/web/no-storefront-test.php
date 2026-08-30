<?php

declare(strict_types=1);

it('does not render storefront html', function (): void {
    $this->get('/')->assertNotFound();
});
