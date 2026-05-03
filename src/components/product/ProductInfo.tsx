'use client';

import React, { useState } from 'react';
import { formatPrice } from '@/lib/products';
import { Product, SKIN_TONES, SkinTone } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import StarRating from '@/components/ui/StarRating';

interface ProductInfoProps {
  product: Product;
  averageRating?: number;
  reviewCount?: number;
}

const toneColor: Record<string, string> = {
  noir:           '#2C1810',
  marron:         '#7B4A2D',
  'marron-clair': '#C68642',
  clair:          '#F0CEAA',
  metisse:        '#A0714F',
};

export default function ProductInfo({ product, averageRating = 0, reviewCount = 0 }: ProductInfoProps) {
  const [selectedShade, setSelectedShade] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showIngredients, setShowIngredients] = useState(false);
  
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  
  const handleAddToCart = () => {
    addItem(product);
  };
  
  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };
  
  const isInStock = product.inStock;
  const needsShadeSelection = product.skinTones && product.skinTones.length > 0;
  const canAddToCart = isInStock && (!needsShadeSelection || selectedShade);
  
  return (
    <div style={{ flex: 1 }}>
      {/* En-tête */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#FAFAFA',
          marginBottom: '8px',
          lineHeight: 1.2
        }}>
          {product.name}
        </h1>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StarRating rating={averageRating} size={16} />
            <span style={{ color: '#888', fontSize: '14px' }}>
              ({reviewCount} avis)
            </span>
          </div>
          
          <div style={{
            padding: '4px 8px',
            background: isInStock ? '#10B98115' : '#EF444415',
            border: `1px solid ${isInStock ? '#10B98130' : '#EF444430'}`,
            borderRadius: '6px',
            color: isInStock ? '#10B981' : '#EF4444',
            fontSize: '11px',
            fontWeight: 600
          }}>
            {isInStock ? `En stock${product.stockQty != null ? ` (${product.stockQty})` : ''}` : 'Rupture de stock'}
          </div>
        </div>
        
        <p style={{
          color: '#CCC',
          fontSize: '16px',
          lineHeight: 1.6,
          marginBottom: '16px'
        }}>
          {product.description}
        </p>
        
        <div style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#D4A24E'
        }}>
          {formatPrice(product.price)}
        </div>
      </div>
      
      {/* Sélection de teinte */}
      {needsShadeSelection && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '16px',
            color: '#FAFAFA',
            marginBottom: '12px',
            fontWeight: 600
          }}>
            Choisir votre teinte
          </h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {product.skinTones?.map(shade => {
              const isSelected = selectedShade === shade;
              const toneKey = shade.toLowerCase().replace(/\s+/g, '-');
              const color = toneColor[toneKey] || '#888';
              
              return (
                <button
                  key={shade}
                  onClick={() => setSelectedShade(shade)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    border: `2px solid ${isSelected ? '#D4A24E' : '#333'}`,
                    background: isSelected ? '#D4A24E15' : '#1A1A1A',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: isSelected ? '#D4A24E' : '#CCC'
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: color,
                    border: '1px solid #666'
                  }} />
                  {shade}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Quantité */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '16px',
          color: '#FAFAFA',
          marginBottom: '12px',
          fontWeight: 600
        }}>
          Quantité
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #333', borderRadius: '8px' }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                width: '40px',
                height: '40px',
                background: '#1A1A1A',
                border: 'none',
                color: '#CCC',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              −
            </button>
            <div style={{
              width: '60px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0A0A0A',
              color: '#FAFAFA',
              fontSize: '16px',
              fontWeight: 600
            }}>
              {quantity}
            </div>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{
                width: '40px',
                height: '40px',
                background: '#1A1A1A',
                border: 'none',
                color: '#CCC',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      {/* Boutons d'action */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          style={{
            flex: 1,
            padding: '16px 24px',
            background: canAddToCart ? '#D4A24E' : '#666',
            color: canAddToCart ? '#000' : '#CCC',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: canAddToCart ? 'pointer' : 'not-allowed'
          }}
        >
          {!isInStock ? 'Rupture de stock' : 
           needsShadeSelection && !selectedShade ? 'Choisir une teinte' :
           'Ajouter au panier'}
        </button>
        
        <button
          onClick={handleWishlistToggle}
          style={{
            width: '56px',
            height: '56px',
            background: isInWishlist(product.id) ? '#EF444415' : '#1A1A1A',
            border: `1px solid ${isInWishlist(product.id) ? '#EF4444' : '#333'}`,
            borderRadius: '8px',
            color: isInWishlist(product.id) ? '#EF4444' : '#CCC',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isInWishlist(product.id) ? '❤️' : '🤍'}
        </button>
      </div>
      
      {/* Informations produit */}
      <div style={{
        background: '#0A0A0A',
        border: '1px solid #222',
        borderRadius: '12px',
        padding: '20px'
      }}>
        {/* Bénéfices */}
        {product.benefits && product.benefits.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              fontSize: '16px',
              color: '#FAFAFA',
              marginBottom: '12px',
              fontWeight: 600
            }}>
              Bénéfices
            </h3>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {product.benefits.map((benefit, index) => (
                <li key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#CCC'
                }}>
                  <span style={{ color: '#D4A24E', fontSize: '12px', marginTop: '2px' }}>✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Ingrédients */}
        {product.ingredients && (
          <div>
            <button
              onClick={() => setShowIngredients(!showIngredients)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#FAFAFA',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '8px 0'
              }}
            >
              <span>Ingrédients</span>
              <span style={{ transform: showIngredients ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </button>
            
            {showIngredients && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: '#1A1A1A',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#CCC',
                lineHeight: 1.5
              }}>
                {product.ingredients}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}