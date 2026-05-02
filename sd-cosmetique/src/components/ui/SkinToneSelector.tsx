'use client';

import React from 'react';
import { SkinTone, SKIN_TONES } from '@/types';

interface SkinToneSelectorProps {
  selected: SkinTone | null;
  onChange: (tone: SkinTone | null) => void;
  label?: string;
}

export default function SkinToneSelector({ selected, onChange, label = 'Filtrer par carnation' }: SkinToneSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      {label && (
        <p className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--grey-700)', letterSpacing: '0.15em' }}>
          {label}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {/* All */}
        <button
          onClick={() => onChange(null)}
          className={`px-3 py-1.5 text-xs font-medium tracking-wide border transition-all duration-200 ${
            selected === null
              ? 'text-white border-transparent'
              : 'border-current hover:border-gray-400'
          }`}
          style={{
            background: selected === null ? 'var(--gold)' : 'transparent',
            color: selected === null ? 'white' : 'var(--grey-700)',
            borderColor: selected === null ? 'var(--gold)' : 'var(--grey-200)',
          }}
        >
          Toutes
        </button>

        {SKIN_TONES.map(tone => (
          <button
            key={tone.id}
            onClick={() => onChange(selected === tone.id ? null : tone.id)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border transition-all duration-200"
            style={{
              background: selected === tone.id ? 'var(--gold-pale)' : 'transparent',
              borderColor: selected === tone.id ? 'var(--gold)' : 'var(--grey-200)',
              color: selected === tone.id ? 'var(--gold-dark)' : 'var(--grey-700)',
            }}
            title={tone.description}
          >
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ background: tone.color, border: '1.5px solid rgba(0,0,0,0.12)' }}
            />
            <span>{tone.label}</span>
            {selected === tone.id && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--gold)' }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
