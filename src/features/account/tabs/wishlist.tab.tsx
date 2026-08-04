'use client';

/* Favoris du client. Extrait de `app/compte/page.tsx` (F-111). */

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/shared/types/domain.type';
import { formatPrice } from '@/features/catalog/product.query';

interface WishlistTabProps {
  readonly isMobile: boolean;
  readonly wishlistItems: Product[];
  readonly removeFromWishlist: (id: string) => void;
}

export default function WishlistTab({ isMobile, wishlistItems, removeFromWishlist }: WishlistTabProps) {
  return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>Mes favoris</h2>
                {wishlistItems.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '48px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 40, marginBottom: 12 }}>🤍</p>
                    <p style={{ fontSize: 14, color: '#9A8A7A', marginBottom: 16 }}>Votre liste de favoris est vide.</p>
                    <Link href="/boutique" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? 320 : 'none', padding: '10px 24px', background: '#3D1400', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Découvrir nos produits</Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
                    {wishlistItems.map(product => (
                      <div key={product.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', height: 180, background: '#FAF8F5' }}>
                          <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1px solid #EDE8E0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: '#DC2626' }}
                          >♥</button>
                        </div>
                        <div style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 4, lineHeight: 1.3 }}>{product.name}</p>
                          <p style={{ fontSize: 14, fontWeight: 800, color: '#C8974A', marginBottom: 12 }}>{formatPrice(product.price)}</p>
                          <Link href={`/boutique/${product.slug}`} style={{ display: 'block', textAlign: 'center', padding: '8px 0', background: '#3D1400', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Voir le produit</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
  );
}
