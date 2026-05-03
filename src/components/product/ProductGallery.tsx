'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (!images || images.length === 0) {
    return (
      <div style={{
        width: '100%',
        height: '500px',
        background: '#1A1A1A',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        Aucune image disponible
      </div>
    );
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Image principale */}
      <div style={{
        width: '100%',
        height: '500px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#1A1A1A',
        position: 'relative'
      }}>
        <Image
          src={images[selectedImage]}
          alt={productName}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      
      {/* Miniatures */}
      {images.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: selectedImage === index ? '2px solid #D4A24E' : '1px solid #333',
                background: '#1A1A1A',
                cursor: 'pointer',
                padding: 0,
                position: 'relative',
                flexShrink: 0
              }}
            >
              <Image
                src={image}
                alt={`${productName} - image ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}