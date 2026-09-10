<?php

declare(strict_types=1);

use App\Shared\Html\HtmlSanitizer;

it('keeps allowed formatting tags', function (): void {
    $clean = HtmlSanitizer::clean('<p>Bonjour <strong>Awa</strong>, merci pour votre <em>commande</em>.</p><ul><li>Un</li><li>Deux</li></ul>');

    expect($clean)->toContain('<strong>Awa</strong>')
        ->and($clean)->toContain('<em>commande</em>')
        ->and($clean)->toContain('<li>Un</li>');
});

it('strips script tags entirely, including their content', function (): void {
    $clean = HtmlSanitizer::clean('<p>Bonjour</p><script>alert("xss")</script>');

    expect($clean)->not->toContain('<script')
        ->and($clean)->not->toContain('alert');
});

it('strips event handler attributes but keeps the tag content', function (): void {
    $clean = HtmlSanitizer::clean('<p onclick="alert(1)">Cliquez ici</p>');

    expect($clean)->not->toContain('onclick')
        ->and($clean)->toContain('Cliquez ici');
});

it('keeps safe links but strips javascript: hrefs', function (): void {
    $safe = HtmlSanitizer::clean('<a href="https://sdcosmetique.ci">Voir</a>');
    $unsafe = HtmlSanitizer::clean('<a href="javascript:alert(1)">Voir</a>');

    expect($safe)->toContain('href="https://sdcosmetique.ci"')
        ->and($unsafe)->not->toContain('javascript:')
        ->and($unsafe)->toContain('Voir');
});

it('removes disallowed tags like iframe but keeps their inner text', function (): void {
    $clean = HtmlSanitizer::clean('<iframe src="evil.com"></iframe><div>Texte gardé</div>');

    expect($clean)->not->toContain('<iframe')
        ->and($clean)->not->toContain('<div')
        ->and($clean)->toContain('Texte gardé');
});

it('keeps images from http(s) sources but strips a data: or javascript: src', function (): void {
    $safe = HtmlSanitizer::clean('<img src="https://sdcosmetique.ci/promo.jpg" alt="Promo">');
    $unsafe = HtmlSanitizer::clean('<img src="javascript:alert(1)" alt="x">');

    expect($safe)->toContain('src="https://sdcosmetique.ci/promo.jpg"')
        ->and($safe)->toContain('alt="Promo"')
        ->and($unsafe)->not->toContain('src=');
});

it('returns an empty string for empty input', function (): void {
    expect(HtmlSanitizer::clean(''))->toBe('')
        ->and(HtmlSanitizer::clean('   '))->toBe('');
});
