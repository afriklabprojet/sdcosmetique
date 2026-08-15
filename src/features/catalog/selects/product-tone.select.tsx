'use client';

/*
 * Cercles de teint de la fiche produit. Extrait de `views/product.view.tsx`
 * (F-112).
 *
 * A ne pas confondre avec `skin-tone.select.tsx`, qui est le filtre de la
 * boutique : celui-ci choisit la teinte d'un produit donne, l'autre restreint
 * une liste. Meme vocabulaire, deux responsabilites.
 */

import Image from 'next/image';
import { SKIN_TONES } from '@/shared/types/domain.type';
import { DARK, GOLD, BORDER, TEXT_MUTED, toneColor, toneImage } from '@/features/catalog/product-detail.constant';
import { ToneCheckIcon } from '@/features/catalog/assets/product-detail-icons';

interface TonePickerProps {
  readonly skinTones: string[];
  readonly selectedTone: string;
  readonly pickTone: (t: string) => void;
  readonly size?: number;
  /** Surcharge des images de teint (depuis site_config). */
  readonly customToneImages?: Record<string, string>;
}

export default function TonePicker({ skinTones, selectedTone, pickTone, size = 40, customToneImages }: TonePickerProps) {
  const resolvedToneImage = { ...toneImage, ...customToneImages };
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {skinTones.map(tone => {
        const info     = SKIN_TONES.find(s => s.id === tone);
        const active = selectedTone === tone;
        return (
          <button key={tone} onClick={() => pickTone(tone)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ width: size, height: size, borderRadius: '50%', background: toneColor[tone] ?? '#888', border: `2px solid ${active ? GOLD : BORDER}`, position: 'relative', overflow: 'hidden', boxShadow: active ? `0 0 0 2px white, 0 0 0 4px ${GOLD}` : 'none', transition: 'box-shadow .2s' }}>
              {resolvedToneImage[tone] && (
                <Image
                  src={resolvedToneImage[tone]}
                  alt={info?.label ?? tone}
                  fill
                  sizes="48px"
                  style={{ objectFit: 'cover' }}
                />
              )}
              {active && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(61,20,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ToneCheckIcon />
                </div>
              )}
            </div>
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, color: active ? DARK : TEXT_MUTED, textAlign: 'center', lineHeight: 1.2 }}>
              {info?.label ?? tone}
            </span>
          </button>
        );
      })}
    </div>
  );
}
