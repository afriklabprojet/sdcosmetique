'use client';

import { useState, useEffect } from 'react';

export default function NewsletterCard() {
  const [count, setCount] = useState<number | null>(null);
  const [latest, setLatest] = useState<Array<{ email: string; created_at: string }>>([]);
  
  useEffect(() => {
    fetch('/api/newsletter/list')
      .then(r => r.ok ? r.json() : { subscribers: [] })
      .then(d => {
        const subs = d.subscribers ?? [];
        setCount(subs.length);
        setLatest(subs.slice(0, 5));
      })
      .catch(() => { setCount(0); setLatest([]); });
  }, []);
  
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '32px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.02em' }}>{count ?? '…'}</span>
        <span style={{ fontSize: '11px', color: '#888' }}>abonné{(count ?? 0) > 1 ? 's' : ''}</span>
      </div>
      <a href="/api/newsletter/list?format=csv" download
        style={{ alignSelf: 'flex-start', fontSize: '11px', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(212,162,78,0.4)', background: 'rgba(212,162,78,0.08)', color: '#D4A24E', cursor: 'pointer', textDecoration: 'none' }}>
        ⬇ Exporter CSV
      </a>
      
      {latest.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Derniers abonnés</div>
          {latest.map((sub, idx) => (
            <div key={idx} style={{ fontSize: '11px', color: '#CCC', padding: '2px 0' }}>
              {sub.email} - {new Date(sub.created_at).toLocaleDateString()}
            </div>
          ))}
        </div>
      )}
    </>
  );
}