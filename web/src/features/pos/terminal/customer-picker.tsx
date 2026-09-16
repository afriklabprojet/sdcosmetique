'use client';

import { useEffect, useState } from 'react';
import { Customer } from '@/shared/api/admin';
import type { CustomerSearchResult } from '@/shared/api/admin/customer';
import type { CustomerSelection } from '@/features/pos/pos.type';
import { SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3 } from '@/features/admin/admin.constant';

type Props = {
  value: CustomerSelection;
  onChange: (value: CustomerSelection) => void;
};

/**
 * Client comptoir par défaut (§7). Recherche serveur d'un client existant
 * (pas de liste complète chargée côté navigateur), ou saisie d'un client de
 * passage — un e-mail renseigné pour ce dernier crée automatiquement un
 * compte à la validation de la vente (réutilise `ClientLinker`, déjà éprouvé
 * par le tunnel web, voir `PosSale::create()`).
 */
export default function CustomerPicker({ value, onChange }: Readonly<Props>) {
  const [expanded, setExpanded] = useState(false);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<CustomerSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- indicateur de chargement pour la recherche débouncée ci-dessous
    setSearching(true);
    const handle = setTimeout(() => {
      Customer.search(term)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [expanded, term]);

  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '14px 16px' }}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT3 }}>Client</span>
        <span style={{ fontSize: '11px', color: GOLD }}>{expanded ? 'Fermer ▲' : 'Changer ▼'}</span>
      </button>

      <p style={{ fontSize: '14px', fontWeight: 600, color: TEXT, margin: '6px 0 0' }}>
        {value.mode === 'client' ? value.name : (value.name || 'Client de passage')}
      </p>
      {value.mode === 'walkin' && value.phone && <p style={{ fontSize: '12px', color: TEXT2, margin: '2px 0 0' }}>{value.phone}</p>}

      {expanded && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={() => { onChange({ mode: 'walkin', name: '', phone: '', email: '' }); setExpanded(false); }}
            style={{ textAlign: 'left', background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '8px', padding: '10px 12px', color: TEXT, fontSize: '13px', cursor: 'pointer' }}
          >
            Client de passage (sans compte)
          </button>

          {value.mode === 'walkin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                placeholder="Nom (optionnel)"
                value={value.name}
                onChange={(e) => onChange({ ...value, name: e.target.value })}
                style={{ background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '6px', color: TEXT, padding: '10px 12px', fontSize: '13px' }}
              />
              <input
                placeholder="Téléphone (optionnel)"
                value={value.phone}
                onChange={(e) => onChange({ ...value, phone: e.target.value })}
                style={{ background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '6px', color: TEXT, padding: '10px 12px', fontSize: '13px' }}
              />
              <input
                type="email"
                placeholder="E-mail (optionnel)"
                value={value.email}
                onChange={(e) => onChange({ ...value, email: e.target.value })}
                style={{ background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '6px', color: TEXT, padding: '10px 12px', fontSize: '13px' }}
              />
              {value.email.trim() !== '' && (
                <p style={{ fontSize: '11px', color: TEXT3, margin: 0 }}>
                  Un compte client sera créé (ou retrouvé) automatiquement avec cet e-mail à la validation de la vente.
                </p>
              )}
            </div>
          )}

          <input
            placeholder="Rechercher un client existant (nom, e-mail, téléphone)…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            style={{ background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '6px', color: TEXT, padding: '10px 12px', fontSize: '13px' }}
          />
          <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {searching && <p style={{ fontSize: '12px', color: TEXT2, padding: '4px 10px' }}>Recherche…</p>}
            {!searching && results.length === 0 && <p style={{ fontSize: '12px', color: TEXT2, padding: '4px 10px' }}>Aucun client trouvé.</p>}
            {results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onChange({ mode: 'client', clientId: c.id, name: c.name, phone: c.phone }); setExpanded(false); }}
                style={{ textAlign: 'left', background: 'none', border: 'none', borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '13px', cursor: 'pointer' }}
              >
                {c.name} <span style={{ color: TEXT3 }}>· {c.email}{c.phone ? ` · ${c.phone}` : ''}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
