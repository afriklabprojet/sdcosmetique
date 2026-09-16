'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';
import { SURFACE, BORDER, GOLD, TEXT, TEXT2, S_ERR_BG, S_ERR_T } from '@/features/admin/admin.constant';

type Props = {
  onDetected: (code: string) => void;
  onClose: () => void;
};

/**
 * Scan code-barres par caméra (§5) — utilise la caméra arrière du téléphone
 * ou de la tablette quand aucun scanner USB/Bluetooth n'est branché.
 * ZXing décode en continu le flux vidéo ; le premier code lu est renvoyé au
 * parent puis la caméra est immédiatement coupée (jamais laissée allumée en
 * arrière-plan).
 */
export default function CameraScannerModal({ onDetected, onClose }: Readonly<Props>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } } },
        videoRef.current!,
        (result, err, controls) => {
          controlsRef.current = controls;
          if (cancelled || !result) return;
          controls.stop();
          onDetected(result.getText());
        },
      )
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Caméra indisponible.');
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ne doit s'exécuter qu'au montage, `onDetected` change à chaque frappe du terme de recherche parent
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: TEXT, margin: 0 }}>Scanner un code-barres</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: TEXT2, fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        {error ? (
          <p style={{ background: S_ERR_BG, color: S_ERR_T, borderRadius: '8px', padding: '12px', fontSize: '13px' }}>
            {error} — vérifiez que l&apos;accès à la caméra est autorisé pour ce site.
          </p>
        ) : (
          <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: '#000' }}>
            <video ref={videoRef} style={{ width: '100%', display: 'block' }} muted playsInline />
            <div style={{ position: 'absolute', inset: '20% 12%', border: `2px solid ${GOLD}`, borderRadius: '8px', pointerEvents: 'none' }} />
          </div>
        )}

        <p style={{ fontSize: '12px', color: TEXT2, marginTop: '12px', textAlign: 'center' }}>
          Visez le code-barres du produit — l&apos;ajout au panier est automatique dès la lecture.
        </p>
      </div>
    </div>
  );
}
