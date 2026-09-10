<?php

declare(strict_types=1);

namespace App\Shared\Html;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMText;

/**
 * Nettoie le HTML saisi par l'admin dans un éditeur riche (message client,
 * campagne marketing) avant stockage et envoi — aucune librairie de
 * purification n'est installée dans le projet (changement de dépendance
 * hors périmètre sans validation), donc allowlist maison via DOMDocument :
 * seules les balises/attributs listés survivent, tout le reste (script,
 * style, gestionnaires on*, liens javascript:) est supprimé en gardant le
 * texte. Protège contre l'injection HTML/XSS (§13) dans un contenu qui finit
 * par e-mail et, potentiellement, par un rendu admin.
 */
class HtmlSanitizer
{
    private const array ALLOWED_TAGS = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'a', 'blockquote', 'span', 'img',
    ];

    private const array ALLOWED_ATTRIBUTES = [
        'a' => ['href'],
        'img' => ['src', 'alt'],
    ];

    /** Balises dont le contenu est dangereux et doit disparaître entièrement (pas juste "dépaquetées"). */
    private const array STRIP_ENTIRELY = ['script', 'style', 'iframe', 'object', 'embed', 'noscript'];

    public static function clean(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }

        $dom = new DOMDocument;
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="utf-8"?><div>'.$html.'</div>', LIBXML_NOERROR | LIBXML_NOWARNING);
        libxml_clear_errors();

        $root = $dom->getElementsByTagName('div')->item(0);

        if ($root === null) {
            return '';
        }

        self::sanitizeChildren($dom, $root);

        $output = '';
        foreach (iterator_to_array($root->childNodes) as $child) {
            $output .= $dom->saveHTML($child);
        }

        return trim($output);
    }

    private static function sanitizeChildren(DOMDocument $dom, DOMNode $parent): void
    {
        foreach (iterator_to_array($parent->childNodes) as $node) {
            if ($node instanceof DOMText) {
                continue;
            }

            if (! $node instanceof DOMElement) {
                $parent->removeChild($node);

                continue;
            }

            $tag = strtolower($node->tagName);

            if (in_array($tag, self::STRIP_ENTIRELY, true)) {
                $parent->removeChild($node);

                continue;
            }

            if (! in_array($tag, self::ALLOWED_TAGS, true)) {
                // Balise non autorisée : on garde son contenu texte, pas la balise.
                self::sanitizeChildren($dom, $node);
                while ($node->firstChild !== null) {
                    $parent->insertBefore($node->firstChild, $node);
                }
                $parent->removeChild($node);

                continue;
            }

            foreach (iterator_to_array($node->attributes ?? []) as $attribute) {
                $name = strtolower($attribute->nodeName);
                $allowed = self::ALLOWED_ATTRIBUTES[$tag] ?? [];

                if (! in_array($name, $allowed, true)) {
                    $node->removeAttribute($attribute->nodeName);

                    continue;
                }

                if ($name === 'href' && ! self::safeUrl($attribute->nodeValue)) {
                    $node->removeAttribute('href');
                }

                if ($name === 'src' && ! self::safeImageUrl($attribute->nodeValue)) {
                    $node->removeAttribute('src');
                }
            }

            self::sanitizeChildren($dom, $node);
        }
    }

    private static function safeUrl(string $url): bool
    {
        $url = trim($url);

        return (bool) preg_match('#^(https?://|mailto:)#i', $url);
    }

    private static function safeImageUrl(string $url): bool
    {
        return (bool) preg_match('#^https?://#i', trim($url));
    }
}
