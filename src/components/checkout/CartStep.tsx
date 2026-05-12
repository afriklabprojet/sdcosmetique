'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/products';
import { GOLD, BORDER, TXT, TXT2 } from './shared';

interface CartStepProps {
  readonly onNext: () => void;
}

export default function CartStep({ onNext }: CartStepProps) {
  const { items, updateQty, removeItem } = useCart();
  
  if (items.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px 24px',
        background: 'white',
        borderRadius: '12px',
        border: `1px solid ${BORDER}`
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛍️</div>
        <h2 style={{ fontSize: '20px', color: TXT, marginBottom: '8px' }}>Votre panier est vide</h2>
        <p style={{ color: TXT2, marginBottom: '24px' }}>Découvrez nos produits et ajoutez-les à votre panier.</p>
        <Link
          href="/boutique"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: GOLD,
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 600
          }}
        >
          Continuer mes achats
        </Link>
      </div>
    );
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: TXT, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>Vérification du panier</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map(item => (
            <div key={item.product.id} style={{
              display: 'flex',
              gap: '14px',
              padding: '14px 16px',
              background: 'white',
              borderRadius: '10px',
              border: `1px solid ${BORDER}`,
              alignItems: 'center'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#F5EDE5',
                flexShrink: 0,
                border: `1px solid ${BORDER}`
              }}>
                <Image
                  src={item.product.images?.[0] || '/placeholder.jpg'}
                  alt={item.product.name}
                  width={72}
                  height={72}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: TXT, marginBottom: '4px', lineHeight: 1.3 }}>{item.product.name}</h3>
                <p style={{ fontSize: '13px', color: GOLD, fontWeight: 700 }}>
                  {formatPrice(item.product.price)} × {item.quantity}
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => updateQty(item.product.id, item.quantity - 1)}
                  style={{
                    width: '30px',
                    height: '30px',
                    border: `1px solid ${BORDER}`,
                    background: 'white',
                    color: TXT,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: 1
                  }}
                >
                  −
                </button>
                
                <span style={{ color: TXT, fontWeight: 700, minWidth: '20px', textAlign: 'center', fontSize: '14px' }}>
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => updateQty(item.product.id, item.quantity + 1)}
                  style={{
                    width: '30px',
                    height: '30px',
                    border: `1px solid ${BORDER}`,
                    background: 'white',
                    color: TXT,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: 1
                  }}
                >
                  +
                </button>
                
                <button
                  onClick={() => removeItem(item.product.id)}
                  style={{
                    marginLeft: '4px',
                    padding: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: '#B45309',
                    cursor: 'pointer',
                    fontSize: '15px',
                    opacity: 0.7
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onNext}
          style={{
            marginTop: '4px',
            padding: '10px 24px',
            background: GOLD,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.03em'
          }}
        >
          Continuer →
        </button>
      </div>
    </div>
  );
}