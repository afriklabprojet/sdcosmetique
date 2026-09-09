'use client';

/* Barre flottante affichée dès qu'au moins un produit est en comparaison. */

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useComparison } from '@/features/comparison/comparison.store';

export default function ComparisonBar() {
  const pathname = usePathname();
  const { items, limit, removeItem, clear } = useComparison();

  // Redondant sur la page de comparaison elle-même, où elle chevaucherait le tableau.
  if (items.length === 0 || pathname === '/comparaison') return null;

  // La fiche produit a sa propre barre d'achat collée en bas sur mobile
  // (StickyPurchase) : on empile la nôtre par-dessus plutôt que de la
  // superposer.
  const onProductPage = pathname.startsWith('/produit/');

  return (
    <div
      role="region"
      aria-label="Comparateur de produits"
      className={onProductPage ? 'floating-bar-above-nav floating-bar-stacked' : 'floating-bar-above-nav'}
      style={{
        position: 'fixed', left: 0, right: 0, zIndex: 58,
        background: '#1A0E05', borderTop: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.18)',
      }}
    >
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 12, color: '#F5EBD9', fontWeight: 600, flexShrink: 0 }}>
          Comparateur ({items.length}/{limit})
        </span>

        <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 0, overflowX: 'auto' }}>
          {items.map(item => (
            <div key={item.id} style={{ position: 'relative', flexShrink: 0, width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#2A1A0A' }}>
              {item.images[0] && (
                <Image src={item.images[0]} alt={item.name} fill sizes="44px" style={{ objectFit: 'cover' }} />
              )}
              <button
                onClick={() => removeItem(item.id)}
                aria-label={`Retirer ${item.name} du comparateur`}
                style={{
                  position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%',
                  background: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A0E05',
                }}
              >✕</button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={clear}
            style={{ fontSize: 11, color: 'rgba(245,235,217,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 6px' }}
          >
            Vider
          </button>
          <Link
            href="/comparaison"
            style={{
              fontSize: 12, fontWeight: 700, color: '#1A0E05', background: '#D4A96A',
              padding: '9px 18px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            Comparer →
          </Link>
        </div>
      </div>
    </div>
  );
}
