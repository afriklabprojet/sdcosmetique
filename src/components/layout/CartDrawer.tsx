'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/products';
import { fetchSiteConfigSection, DEFAULT_SITE_CONFIG } from '@/lib/site-config';
import type { ShippingConfig, ShippingOption } from '@/lib/site-config';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice, totalItems } = useCart();
  const [shippingCfg, setShippingCfg] = useState<ShippingConfig>(DEFAULT_SITE_CONFIG.shipping);
  useEffect(() => { fetchSiteConfigSection('shipping').then(setShippingCfg).catch(() => {}); }, []);

  // Option la plus économique avec un seuil freeFrom (pour la barre de progression)
  const firstOptWithFree: ShippingOption | undefined = (shippingCfg.options ?? []).find(o => o.active && o.freeFrom > 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Fermer le panier"
          className="fixed inset-0 z-60 transition-opacity duration-300 w-full h-full border-0 p-0 cursor-default"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
          onClick={closeCart}
        />
      )}

      {/* Wrapper clip — overflow:hidden sur un fixed clippe ses enfants absolute,
          évitant que le drawer fermé (translateX(100%)) dépasse de 448px à droite */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 70,
        }}
      >
      {/* Drawer */}
      <div
        role="dialog"
        aria-modal={isOpen || undefined}
        aria-label="Panier"
        aria-hidden={!isOpen}
        className="flex flex-col w-full max-w-md transition-transform duration-500"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          background: 'white',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          boxShadow: 'var(--shadow-xl)',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        {/* Annonce SR live — mise à jour à chaque changement du panier */}
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          {items.length === 0
            ? 'Panier vide'
            : `${totalItems} article${totalItems === 1 ? '' : 's'} dans le panier, total ${formatPrice(totalPrice)}`}
        </div>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--grey-200)' }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
              Mon Panier
            </h2>
            <p className="text-xs text-gray-500 mt-0.5" aria-live="polite">{totalItems} article{totalItems === 1 ? '' : 's'}</p>
          </div>
          <button onClick={closeCart} aria-label="Fermer le panier" className="p-2 hover:opacity-70 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--gold-pale)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: 'var(--gold)' }}>
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Votre panier est vide</p>
                <p className="text-xs" style={{ color: 'var(--grey-500)' }}>Découvrez nos produits et ajoutez vos favoris</p>
              </div>
              <button
                onClick={closeCart}
                className="text-xs font-medium tracking-widest uppercase mt-2 px-6 py-3 text-white"
                style={{ background: 'var(--gold)' }}
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="flex gap-4 pb-4 border-b" style={{ borderColor: 'var(--grey-100)' }}>
                {/* Image */}
                <div className="w-20 h-20 shrink-0 overflow-hidden relative" style={{ background: 'var(--cream)' }}>
                  {item.product.images[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : null}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium leading-tight mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                    {item.product.name}
                  </h4>
                  <p className="text-xs mb-3" style={{ color: 'var(--gold)', fontWeight: 600 }}>
                    {formatPrice(item.product.price)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border" style={{ borderColor: 'var(--grey-200)' }}>
                      <button
                        onClick={() => updateQty(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-50 transition-colors"
                      >−</button>
                      <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-50 transition-colors"
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-xs hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--grey-500)' }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t space-y-4" style={{ borderColor: 'var(--grey-200)', background: 'var(--off-white)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sous-total</span>
              <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold)' }}>
                {formatPrice(totalPrice)}
              </span>
            </div>
            {/* ── Barre progression livraison gratuite ── */}
            {firstOptWithFree && (
              <div>
                {totalPrice >= firstOptWithFree.freeFrom ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#F0FDF4', borderRadius: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', margin: 0 }}>{shippingCfg.freeShippingMessage || 'Livraison gratuite appliquée !'}</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--grey-500)', marginBottom: 5 }}>
                      Plus que{' '}
                      <strong style={{ color: 'var(--gold-dark)' }}>
                        {(firstOptWithFree.freeFrom - totalPrice).toLocaleString('fr-FR')} FCFA
                      </strong>{' '}
                      pour la livraison gratuite ({firstOptWithFree.label})
                    </p>
                    <div style={{ height: 4, background: 'var(--cream)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (totalPrice / firstOptWithFree.freeFrom) * 100).toFixed(1)}%`,
                        background: 'var(--gold)',
                        borderRadius: 99,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                )}
              </div>
            )}
            <Link href="/checkout" onClick={closeCart}>
              <button className="w-full py-4 text-sm font-medium text-white tracking-widest uppercase transition-all duration-300 hover:opacity-90"
                style={{ background: 'var(--gold)', letterSpacing: '0.15em' }}>
                Commander — {formatPrice(totalPrice)}
              </button>
            </Link>
            <button
              onClick={closeCart}
              className="w-full py-3 text-xs font-medium tracking-widest uppercase border transition-all duration-300 hover:bg-gray-50"
              style={{ borderColor: 'var(--grey-300)', color: 'var(--grey-700)', letterSpacing: '0.12em' }}
            >
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
      </div> {/* /clip wrapper */}
    </>
  );
}
