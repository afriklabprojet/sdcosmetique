'use client';

import { useState, useTransition } from 'react';
import type { GlobalPromoConfig } from '@/lib/config/types';
import { saveSiteConfigSection } from '@/app/admin/actions';

interface Props {
  initialConfig: GlobalPromoConfig;
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  // Trim seconds to comply with <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
  return iso.slice(0, 16);
}

function fromDatetimeLocal(val: string): string | null {
  if (!val) return null;
  return new Date(val).toISOString();
}

export default function GlobalPromoCard({ initialConfig }: Readonly<Props>) {
  const [cfg, setCfg] = useState<GlobalPromoConfig>(initialConfig);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof GlobalPromoConfig>(key: K, value: GlobalPromoConfig[K]) {
    setCfg(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleToggle() {
    const newEnabled = !cfg.enabled;
    const newCfg = { ...cfg, enabled: newEnabled };
    setCfg(newCfg);
    setSaved(false);
    setError(null);
    startTransition(async () => {
      try {
        await saveSiteConfigSection('global_promo', newCfg);
        setSaved(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde');
      }
    });
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await saveSiteConfigSection('global_promo', cfg);
        setSaved(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde');
      }
    });
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(212,162,78,0.25)',
    borderRadius: 6,
    color: '#FAFAFA',
    padding: '6px 10px',
    fontSize: 12,
    width: '100%',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    display: 'block',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Toggle activer / désactiver */}
      <button
        type="button"
        role="switch"
        aria-checked={cfg.enabled}
        onClick={() => handleToggle()}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleToggle()}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
      >
        <span
          style={{
            width: 36,
            height: 20,
            borderRadius: 10,
            background: cfg.enabled ? '#D4A24E' : 'rgba(255,255,255,0.12)',
            position: 'relative',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: cfg.enabled ? 18 : 2,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          />
        </span>
        <span style={{ fontSize: 13, color: cfg.enabled ? '#D4A24E' : '#888', fontWeight: 600 }}>
          {cfg.enabled ? 'Promo activée' : 'Promo désactivée'}
        </span>
      </button>

      {/* Remise */}
      <div>
        <label htmlFor="promo-pct" style={labelStyle}>Remise globale (%)</label>
        <input
          id="promo-pct"
          type="number"
          min={1}
          max={99}
          value={cfg.discountPercentage}
          onChange={e => update('discountPercentage', Math.min(99, Math.max(1, Number(e.target.value))))}
          style={{ ...inputStyle, width: 90 }}
        />
      </div>

      {/* Label badge */}
      <div>
        <label htmlFor="promo-label" style={labelStyle}>Libellé du badge</label>
        <input
          id="promo-label"
          type="text"
          maxLength={12}
          value={cfg.label}
          onChange={e => update('label', e.target.value)}
          placeholder="PROMO"
          style={inputStyle}
        />
      </div>

      {/* Couleur badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div>
          <label htmlFor="promo-color" style={labelStyle}>Couleur du badge</label>
          <input
            id="promo-color"
            type="color"
            value={cfg.badgeColor}
            onChange={e => update('badgeColor', e.target.value)}
            style={{ width: 44, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none', padding: 0 }}
          />
        </div>
        <span style={{ fontSize: 12, color: '#888', marginTop: 16 }}>{cfg.badgeColor}</span>
      </div>

      {/* Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label htmlFor="promo-start" style={labelStyle}>Début (optionnel)</label>
          <input
            id="promo-start"
            type="datetime-local"
            value={toDatetimeLocal(cfg.startAt)}
            onChange={e => update('startAt', fromDatetimeLocal(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="promo-end" style={labelStyle}>Fin (optionnel)</label>
          <input
            id="promo-end"
            type="datetime-local"
            value={toDatetimeLocal(cfg.endAt)}
            onChange={e => update('endAt', fromDatetimeLocal(e.target.value))}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Aperçu */}
      <div style={{ background: 'rgba(212,162,78,0.06)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#bbb' }}>
        <span style={{ color: '#D4A24E', fontWeight: 600 }}>Aperçu · </span>
        Badge{' '}
        <span
          style={{
            display: 'inline-block',
            background: cfg.badgeColor,
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            padding: '1px 5px',
            borderRadius: 3,
            letterSpacing: '0.05em',
            verticalAlign: 'middle',
          }}
        >
          -{cfg.discountPercentage}%
        </span>{' '}
        {cfg.label && (
          <span
            style={{
              display: 'inline-block',
              background: cfg.badgeColor,
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: 3,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              verticalAlign: 'middle',
              marginLeft: 4,
            }}
          >
            {cfg.label}
          </span>
        )}
      </div>

      {/* Feedback + bouton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={handleSave}
          disabled={isPending}
          style={{
            padding: '7px 18px',
            borderRadius: 6,
            border: '1px solid rgba(212,162,78,0.5)',
            background: isPending ? 'rgba(212,162,78,0.1)' : 'rgba(212,162,78,0.15)',
            color: '#D4A24E',
            fontSize: 12,
            fontWeight: 600,
            cursor: isPending ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {isPending ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
        {saved && <span style={{ fontSize: 12, color: '#4CAF50' }}>✓ Sauvegardé</span>}
        {error && <span style={{ fontSize: 12, color: '#f44336' }}>{error}</span>}
      </div>
    </div>
  );
}
