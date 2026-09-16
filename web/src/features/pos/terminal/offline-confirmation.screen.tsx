'use client';

import { formatPrice } from '@/shared/format/price';
import { SURFACE, BORDER, GOLD, TEXT, TEXT2 } from '@/features/admin/admin.constant';

type Props = {
  total: number;
  onNewSale: () => void;
};

/**
 * Vente prise hors-ligne (§30) : pas de référence Laravel tant que la
 * synchronisation n'a pas eu lieu, donc pas de reçu PDF imprimable ici — juste
 * la confirmation que la vente est bien enregistrée localement et sera
 * transmise dès la reconnexion (voir `useOfflineSync`).
 */
export default function OfflineConfirmationScreen({ total, onNewSale }: Readonly<Props>) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(212,162,90,0.15)', color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', margin: '0 auto 16px' }}>⏳</div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>Vente enregistrée hors-ligne</h2>
        <p style={{ fontSize: '13px', color: TEXT2, margin: '0 0 20px' }}>
          Aucune connexion au serveur. Elle sera transmise et son numéro attribué automatiquement dès le retour de la connexion.
        </p>
        <p style={{ fontSize: '30px', fontWeight: 800, color: GOLD, margin: '0 0 24px' }}>{formatPrice(total)}</p>

        <button type="button" onClick={onNewSale}
          style={{ width: '100%', padding: '16px', background: GOLD, color: '#1A0E05', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 800, cursor: 'pointer' }}>
          NOUVELLE VENTE
        </button>
      </div>
    </div>
  );
}
