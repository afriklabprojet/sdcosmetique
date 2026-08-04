'use client';

/*
 * Frise des quatre etapes de traitement. Extraite de
 * `app/confirmation/page.tsx` (F-114). Elle ne depend d'aucune commande :
 * c'est un rappel du parcours, identique pour tout le monde.
 */

import { BORDER, DARK, TXT, TXT2 } from '@/features/orders/confirmation.constant';
import { NEXT_STEPS } from '@/features/orders/assets/order-step-icons';

export default function OrderStepsCard() {
  return (
            <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '32px 32px 36px' }}>
              <h2 style={{
                fontSize: '12px', fontWeight: 800, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: DARK, textAlign: 'center', marginBottom: '32px',
              }}>
                Quelles sont les prochaines étapes&nbsp;?
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', position: 'relative' }}>
                {/* Dashed connectors */}
                {[0, 1, 2].map(i => (
                  <div key={i} aria-hidden="true" style={{
                    position: 'absolute', top: '24px',
                    left: `calc(${(i + 1) * 25}% - 8px)`,
                    width: 'calc(25% - 16px)', height: '1px',
                    borderTop: `2px dashed ${BORDER}`, zIndex: 0,
                  }} />
                ))}

                {NEXT_STEPS.map(s => (
                  <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    {/* Icon circle */}
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: s.active ? '#FDF4E8' : '#FAF8F5',
                      border: `1px solid ${s.active ? '#D4A25A' : BORDER}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '10px', flexShrink: 0,
                    }}>
                      <s.Icon />
                    </div>
                    {/* Number badge */}
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: s.active ? DARK : '#EDE8E0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '8px',
                    }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: s.active ? 'white' : TXT2 }}>{s.id}</span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: s.active ? DARK : TXT, textAlign: 'center', marginBottom: '5px', lineHeight: 1.3 }}>
                      {s.label}
                    </p>
                    <p style={{ fontSize: '11px', color: TXT2, textAlign: 'center', lineHeight: 1.5 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
  );
}
