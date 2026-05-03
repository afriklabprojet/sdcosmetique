import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: '2px solid #8F5922',
        background: '#FAF8F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Georgia, serif',
        fontSize: 13,
        fontWeight: 600,
        fontStyle: 'italic',
        color: '#8F5922',
        letterSpacing: '-0.5px',
      }}
    >
      SD
    </div>,
    { ...size },
  );
}
