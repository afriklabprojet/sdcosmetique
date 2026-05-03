'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/products';

interface CartStepProps {
  onNext: () => void;
}

export default function CartStep({ onNext }: CartStepProps) {
  const { items, updateQty, removeItem, totalPrice } = useCart();
  
  if (items.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px 24px',
        background: '#0A0A0A',
        borderRadius: '12px',
        border: '1px solid #222'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛍️</div>
        <h2 style={{ fontSize: '20px', color: '#FAFAFA', marginBottom: '8px' }}>Votre panier est vide</h2>
        <p style={{ color: '#888', marginBottom: '24px' }}>Découvrez nos produits et ajoutez-les à votre panier.</p>
        <Link
          href="/boutique"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#D4A24E',
            color: '#000',
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
    <div style={{ display: 'flex', gap: '24px' }}>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '20px', color: '#FAFAFA', marginBottom: '16px' }}>Vérification du panier</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map(item => (
            <div key={item.product.id} style={{
              display: 'flex',
              gap: '16px',
              padding: '16px',
              background: '#0A0A0A',
              borderRadius: '12px',
              border: '1px solid #222'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#1A1A1A'
              }}>
                <Image
                  src={item.product.images?.[0] || '/placeholder.jpg'}
                  alt={item.product.name}
                  width={80}
                  height={80}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', color: '#FAFAFA', marginBottom: '4px' }}>{item.product.name}</h3>
                <p style={{ fontSize: '14px', color: '#D4A24E', fontWeight: 600 }}>
                  {formatPrice(item.product.price)} × {item.quantity}
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => updateQty(item.product.id, item.quantity - 1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '1px solid #333',
                    background: '#1A1A1A',
                    color: '#CCC',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  −
                </button>
                
                <span style={{ color: '#FAFAFA', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => updateQty(item.product.id, item.quantity + 1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '1px solid #333',
                    background: '#1A1A1A',
                    color: '#CCC',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
                
                <button
                  onClick={() => removeItem(item.product.id)}
                  style={{
                    marginLeft: '8px',
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#EF4444',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ width: '320px' }}>
        <div style={{
          background: '#0A0A0A',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #222',
          position: 'sticky',
          top: '24px'
        }}>
          <h3 style={{ fontSize: '16px', color: '#FAFAFA', marginBottom: '16px' }}>Résumé de commande</h3>
          
          <div style={{ borderBottom: '1px solid #222', paddingBottom: '16px', marginBottom: '16px' }}>
            {items.map(item => (
              <div key={item.product.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                <span style={{ color: '#CCC' }}>
                  {item.product.name} ×{item.quantity}
                </span>
                <span style={{ color: '#FAFAFA' }}>
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '18px',
            fontWeight: 700,
            color: '#D4A24E',
            marginBottom: '20px'
          }}>
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          
          <button
            onClick={onNext}
            style={{
              width: '100%',
              padding: '14px',
              background: '#D4A24E',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Continuer →
          </button>
        </div>
      </div>
    </div>
  );
}