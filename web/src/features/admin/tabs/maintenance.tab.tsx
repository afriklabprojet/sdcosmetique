'use client';

/* Onglet « Maintenance » — bascule publique (réglage "maintenance") qui bloque
 * tout le site derrière une page d'attente pendant une mise à jour. /admin
 * reste toujours accessible (le proxy web l'exclut explicitement) pour
 * pouvoir redésactiver le mode maintenance. Le développeur garde, lui, un
 * accès normal au rendu via un lien secret (`?preview=...`, configuré côté
 * serveur web) — ce lien n'est pas géré ici, c'est un secret d'infrastructure
 * distinct des réglages métier. */

import React, { useEffect, useState } from 'react';
import { fetchAdminSetting, patchAdminSetting } from '@/shared/api/settings';
import { getSaveButtonText } from '@/features/admin/admin.util';
import { toast } from '@/shared/ui/toast';
import { BG, SURFACE, BORDER, BORDER2, GOLD2, TEXT, TEXT2, TEXT3, S_SAVE_BG, S_SAVE_T, inputStyle } from '@/features/admin/admin.constant';

type MaintenanceSettings = { enabled: boolean; message: string };

const DEFAULTS: MaintenanceSettings = {
  enabled: false,
  message: 'Nous effectuons une mise à jour du site.\nMerci de repasser dans quelques instants.',
};

interface MaintenanceTabProps {
  readonly onSaved: () => void;
}

export default function MaintenanceTab({ onSaved }: MaintenanceTabProps) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<MaintenanceSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchAdminSetting('maintenance')
      .then((value) => {
        if (value && typeof value === 'object') {
          setSettings({ ...DEFAULTS, ...(value as Partial<MaintenanceSettings>) });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (patch: Partial<MaintenanceSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      // is_public reste toujours `true` : la page publique et le proxy
      // doivent pouvoir lire ce réglage sans authentification.
      await patchAdminSetting('maintenance', settings, true);
      setSaved(true);
      onSaved();
      toast.success(settings.enabled ? 'Site basculé en maintenance.' : 'Maintenance désactivée — le site est de nouveau accessible.');
    } catch {
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { fontSize: '11px', color: TEXT2, marginBottom: '6px', display: 'block' as const, fontWeight: 600 };
  const sectionCard = { background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '22px 24px', marginBottom: '18px' };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>Chargement…</div>;
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: TEXT, margin: 0 }}>Maintenance</h1>
        <p style={{ fontSize: '12px', color: TEXT3, marginTop: '4px' }}>
          Affiche une page d&apos;attente à tous les visiteurs pendant que vous effectuez des mises à jour.
          L&apos;administration reste toujours accessible.
        </p>
      </div>

      <div style={{
        ...sectionCard,
        border: `1.5px solid ${settings.enabled ? '#EF4444' : BORDER}`,
        background: settings.enabled ? 'rgba(239,68,68,0.06)' : SURFACE,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: settings.enabled ? '18px' : 0 }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: TEXT, marginBottom: '4px' }}>
              {settings.enabled ? '🔴 Site actuellement en maintenance' : 'Site actuellement en ligne'}
            </p>
            <p style={{ fontSize: '12px', color: TEXT3 }}>
              {settings.enabled ? 'Tous les visiteurs voient la page d\'attente.' : 'Activez pour bloquer temporairement le site pendant une mise à jour.'}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={settings.enabled}
            onClick={() => update({ enabled: !settings.enabled })}
            style={{
              flexShrink: 0, width: '52px', height: '30px', borderRadius: '99px', border: 'none', cursor: 'pointer',
              background: settings.enabled ? '#EF4444' : BORDER2, position: 'relative', transition: 'background .2s',
            }}
          >
            <span style={{
              position: 'absolute', top: '3px', left: settings.enabled ? '25px' : '3px', width: '24px', height: '24px',
              borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>

        {settings.enabled && (
          <label>
            <span style={labelStyle}>Message affiché aux visiteurs</span>
            <textarea value={settings.message} onChange={(e) => update({ message: e.target.value })}
              style={{ ...inputStyle, minHeight: '90px', resize: 'vertical', padding: '10px 12px' }} />
          </label>
        )}
      </div>

      <div style={sectionCard}>
        <p style={{ fontSize: '12px', fontWeight: 800, color: GOLD2, marginBottom: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Pour le développeur
        </p>
        <p style={{ fontSize: '12px', color: TEXT2, lineHeight: 1.7 }}>
          Pendant que le site est en maintenance, vous (l&apos;admin) gardez toujours accès à cette administration.
          Pour que le <strong>développeur</strong> puisse continuer à voir le site normalement (vérifier le rendu
          pendant la mise à jour), il ouvre une seule fois un lien avec le code secret configuré sur le serveur
          (<code style={{ background: BG, padding: '1px 5px', borderRadius: '4px', fontSize: '11px' }}>MAINTENANCE_BYPASS_SECRET</code>) :
        </p>
        <div style={{ background: BG, border: `1px solid ${BORDER2}`, borderRadius: '8px', padding: '10px 12px', marginTop: '10px', fontSize: '11.5px', color: TEXT3, fontFamily: 'monospace' }}>
          https://sdcosmetique.ci/?preview=&lt;le code secret&gt;
        </div>
        <p style={{ fontSize: '11px', color: TEXT3, marginTop: '10px' }}>
          Un cookie garde ensuite l&apos;accès pendant 7 jours — inutile de répéter le lien à chaque page.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px 24px' }}>
        <span style={{ fontSize: '11px', color: TEXT3 }}>
          {saved ? '✓ Enregistré' : 'Modifications non sauvegardées'}
        </span>
        <button onClick={save} disabled={saving}
          style={{ padding: '12px 32px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', background: saved ? S_SAVE_BG : GOLD2, color: saved ? S_SAVE_T : BG }}>
          {getSaveButtonText(saved, saving)}
        </button>
      </div>
    </div>
  );
}
