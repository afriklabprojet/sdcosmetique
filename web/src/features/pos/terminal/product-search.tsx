'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pos, type PosProduct } from '@/shared/api/admin/pos';
import { formatPrice } from '@/shared/format/price';
import { toast } from '@/shared/ui/toast';
import CameraScannerModal from '@/features/pos/terminal/camera-scanner.modal';
import { SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3 } from '@/features/admin/admin.constant';

type Props = {
  onAdd: (product: PosProduct) => void;
};

/**
 * Recherche produit (§4) + scan code-barres (§5). Un scanner USB/Bluetooth se
 * comporte comme un clavier : il tape les caractères puis "Entrée" très vite —
 * on l'intercepte globalement, sans exiger que le champ de recherche ait le
 * focus, pour que le vendeur puisse scanner à tout moment.
 */
export default function ProductSearch({ onAdd }: Readonly<Props>) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const scanBuffer = useRef('');
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleBarcode = useCallback(async (code: string) => {
    const product = await Pos.productByBarcode(code);
    if (product) {
      onAdd(product);
      toast.success(`${product.title} ajouté.`);
    } else {
      toast.error('Produit introuvable.');
    }
  }, [onAdd]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- indicateur de chargement pour la recherche débouncée ci-dessous
    setLoading(true);
    const handle = setTimeout(() => {
      Pos.searchProducts(term)
        .then(setResults)
        .catch(() => toast.error('Recherche indisponible.'))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [term]);

  useEffect(() => {
    async function handleKeydown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typingInField = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      if (e.key === 'Enter' && scanBuffer.current.length >= 4 && !typingInField) {
        const code = scanBuffer.current;
        scanBuffer.current = '';
        await handleBarcode(code);
        return;
      }

      if (!typingInField && e.key.length === 1) {
        scanBuffer.current += e.key;
        if (scanTimer.current) clearTimeout(scanTimer.current);
        // Un humain qui tape ne va jamais aussi vite qu'un scanner — 80ms
        // sans nouvelle frappe suffit à distinguer les deux et purger le tampon.
        scanTimer.current = setTimeout(() => { scanBuffer.current = ''; }, 80);
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleBarcode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Rechercher un produit (nom, SKU)… ou scannez un code-barres"
          autoFocus
          style={{
            flex: 1, background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '10px',
            color: TEXT, padding: '16px 18px', fontSize: '16px', outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          title="Scanner avec la caméra"
          style={{
            flexShrink: 0, width: '54px', background: SURFACE2, border: `1px solid ${BORDER2}`,
            borderRadius: '10px', color: GOLD, fontSize: '20px', cursor: 'pointer',
          }}
        >
          📷
        </button>
      </div>

      {cameraOpen && (
        <CameraScannerModal
          onClose={() => setCameraOpen(false)}
          onDetected={(code) => { setCameraOpen(false); void handleBarcode(code); }}
        />
      )}

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', alignContent: 'start' }}>
        {loading && results.length === 0 && <p style={{ color: TEXT2, gridColumn: '1 / -1' }}>Recherche…</p>}
        {!loading && results.length === 0 && <p style={{ color: TEXT2, gridColumn: '1 / -1' }}>Aucun produit.</p>}
        {results.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => product.available && onAdd(product)}
            disabled={!product.available}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px',
              background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '14px',
              cursor: product.available ? 'pointer' : 'not-allowed', opacity: product.available ? 1 : 0.45,
              textAlign: 'left', minHeight: '104px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>{product.title}</span>
            {product.label && <span style={{ fontSize: '11px', color: TEXT3 }}>{product.label}</span>}
            <span style={{ fontSize: '15px', fontWeight: 700, color: GOLD, marginTop: 'auto' }}>{formatPrice(product.unit_price)}</span>
            <span style={{ fontSize: '10px', color: product.available ? TEXT3 : '#E07A7A' }}>
              {product.available ? `Stock : ${product.stock}` : 'Rupture'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
