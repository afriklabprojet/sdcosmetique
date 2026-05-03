'use client';

import { useState, useEffect } from 'react';

interface QuizResult {
  skin_tone: string | null;
  concern: string | null;
  routine: string | null;
  created_at: string;
}

interface RowProps {
  label: string;
  count: number;
  max: number;
}

function Row({ label, count, max }: RowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <span style={{ fontSize: '10px', color: '#AAA', width: '60px', textAlign: 'right' }}>{count}</span>
      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: '#222', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #D4A24E, #F4C26B)',
          width: `${Math.max(2, (count / max) * 100)}%`,
          borderRadius: '3px'
        }} />
      </div>
      <span style={{ fontSize: '10px', color: '#CCC', width: '80px' }}>{label}</span>
    </div>
  );
}

export default function QuizAnalyticsCard() {
  const [items, setItems] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quiz/results')
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => { setItems(d.results ?? []); setLoading(false); })
      .catch(() => { setItems([]); setLoading(false); });
  }, []);

  const total = items.length;
  const last30 = items.filter(i => Date.now() - new Date(i.created_at).getTime() < 30 * 86400000).length;
  
  const tally = (key: 'skin_tone' | 'concern' | 'routine') => {
    const m = new Map<string, number>();
    items.forEach(it => {
      const v = it[key];
      if (v) m.set(v, (m.get(v) ?? 0) + 1);
    });
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  };

  const concerns = tally('concern');
  const tones = tally('skin_tone');
  const routines = tally('routine');
  const maxConcern = concerns[0]?.[1] ?? 1;

  if (loading) {
    return <div style={{ color: '#888' }}>Chargement des analytics...</div>;
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '32px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.02em' }}>{total}</span>
        <span style={{ fontSize: '11px', color: '#888' }}>quiz terminé{total > 1 ? 's' : ''}</span>
        <span style={{ fontSize: '10px', color: '#666', marginLeft: '8px' }}>+{last30} ce mois</span>
      </div>
      
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontSize: '12px', color: '#D4A24E', marginBottom: '8px', fontWeight: 600 }}>Top préoccupations</div>
        {concerns.slice(0, 4).map(([label, count]) => (
          <Row key={label} label={label} count={count} max={maxConcern} />
        ))}
      </div>
      
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontSize: '12px', color: '#D4A24E', marginBottom: '8px', fontWeight: 600 }}>Teints populaires</div>
        {tones.slice(0, 3).map(([label, count]) => (
          <Row key={label} label={label} count={count} max={maxConcern} />
        ))}
      </div>
    </>
  );
}