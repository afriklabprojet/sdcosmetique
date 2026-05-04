import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'SD Cosmetique — Beauté Africaine de Prestige';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#FAF8F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Fond décoratif — cercles concentriques */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 700,
            height: 700,
            borderRadius: '50%',
            border: '1px solid rgba(143,89,34,0.08)',
            position: 'absolute',
          }}
        />
        <div
          style={{
            width: 520,
            height: 520,
            borderRadius: '50%',
            border: '1px solid rgba(143,89,34,0.12)',
            position: 'absolute',
          }}
        />
      </div>

      {/* Contenu centré */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
        }}
      >
        {/* Monogramme */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: '3px solid #8F5922',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Georgia, serif',
            fontSize: 52,
            fontWeight: 600,
            fontStyle: 'italic',
            color: '#8F5922',
            letterSpacing: '-2px',
          }}
        >
          SD
        </div>

        {/* Nom de marque */}
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 52,
            fontWeight: 600,
            color: '#8F5922',
            letterSpacing: '10px',
            textTransform: 'uppercase',
          }}
        >
          SD COSMETIQUE
        </div>

        {/* Trait décoratif */}
        <div
          style={{
            width: 80,
            height: 1.5,
            background: '#B8782E',
            opacity: 0.6,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: 18,
            color: '#B8782E',
            letterSpacing: '5px',
            textTransform: 'uppercase',
          }}
        >
          BEAUTÉ AFRICAINE DE PRESTIGE
        </div>
      </div>
    </div>,
    { ...size },
  );
}
