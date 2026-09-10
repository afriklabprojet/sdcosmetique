'use client';

/* Onglet « Détails de la facture » (§3) — réglages boutique utilisés pour
 * générer le reçu/facture PDF de chaque commande. Autonome (pas relié au
 * store `SiteConfig` public) car ces informations sont admin-only. */

import React, { useEffect, useState } from 'react';
import ImageUpload from '@/shared/ui/image.input';
import { getSaveButtonText } from '@/features/admin/admin.util';
import { fetchAdminSetting, patchAdminSetting } from '@/shared/api/settings';
import { apiUrl } from '@/shared/api/client';
import { toast } from '@/shared/ui/toast';
import { BG, SURFACE, BORDER, GOLD, TEXT, TEXT2, TEXT3, GOLD2, S_SAVE_BG, S_SAVE_T } from '@/features/admin/admin.constant';

type InvoiceDetails = {
  logoUrl: string;
  businessName: string;
  legalName: string;
  phone: string;
  phoneSecondary: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  city: string;
  country: string;
  rccm: string;
  taxId: string;
  footerText: string;
  terms: string;
  thankYouMessage: string;
};

const DEFAULTS: InvoiceDetails = {
  logoUrl: '', businessName: '', legalName: '', phone: '', phoneSecondary: '',
  whatsapp: '', email: '', website: '', address: '', city: '', country: '',
  rccm: '', taxId: '', footerText: '', terms: '',
  thankYouMessage: 'Merci pour votre confiance.\nSD COSMETIQUE – Prenez soin de votre peau.',
};

export default function InvoiceSettingsTab() {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<InvoiceDetails>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchAdminSetting('invoice_details')
      .then((value) => {
        if (value && typeof value === 'object') {
          setDetails({ ...DEFAULTS, ...(value as Partial<InvoiceDetails>) });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (patch: Partial<InvoiceDetails>) => {
    setDetails((d) => ({ ...d, ...patch }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await patchAdminSetting('invoice_details', details, false);
      setSaved(true);
      toast.success('Détails de la facture enregistrés.');
    } catch {
      toast.error("Erreur lors de l'enregistrement des détails de la facture.");
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = { background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 12px', color: TEXT, fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' as const };
  const labelStyle = { fontSize: '11px', color: TEXT2, marginBottom: '6px', display: 'block' as const, fontWeight: 600, letterSpacing: '0.02em' };
  const sectionCard = { background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '22px 24px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };
  const sectionTitle = { fontSize: '12px', fontWeight: 800, color: GOLD, marginBottom: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' as const };
  const sectionSubtitle = { fontSize: '11px', color: TEXT3, marginBottom: '18px' };
  const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>Chargement…</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: TEXT, margin: 0 }}>Détails de la facture</h1>
          <p style={{ fontSize: '12px', color: TEXT3, marginTop: '4px' }}>
            Ces informations apparaissent sur chaque reçu/facture PDF <strong>et</strong> dans l&apos;en-tête et le pied de
            page de tous vos e-mails (confirmation de commande, messages, campagnes marketing). Un seul endroit à
            mettre à jour — inutile de configurer votre logo ou votre adresse ailleurs. Les données du client, des
            produits et du paiement viennent toujours automatiquement de la commande — jamais saisies ici.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <a href={apiUrl('/admin/invoice-preview')} target="_blank" rel="noopener noreferrer"
            style={{ padding: '11px 18px', borderRadius: '10px', border: `1px solid ${BORDER}`, fontWeight: 700, fontSize: '13px', cursor: 'pointer', background: 'transparent', color: TEXT, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Aperçu de la facture
          </a>
          <button onClick={save} disabled={saving}
            style={{ padding: '11px 20px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', background: saved ? S_SAVE_BG : GOLD2, color: saved ? S_SAVE_T : BG }}>
            {getSaveButtonText(saved, saving)}
          </button>
        </div>
      </div>

      <div style={sectionCard}>
        <p style={sectionTitle}>● Logo</p>
        <p style={sectionSubtitle}>Affiché en haut de chaque facture.</p>
        <ImageUpload value={details.logoUrl} selectImage={(url) => update({ logoUrl: url })} folder="invoicing" label="Logo facture" previewSize={100} />
      </div>

      <div style={sectionCard}>
        <p style={sectionTitle}>● Identité de la boutique</p>
        <p style={sectionSubtitle}>Nom commercial et raison sociale légale.</p>
        <div style={grid2}>
          <label>
            <span style={labelStyle}>Nom commercial</span>
            <input type="text" value={details.businessName} onChange={(e) => update({ businessName: e.target.value })} style={fieldStyle} placeholder="SD Cosmétique" />
          </label>
          <label>
            <span style={labelStyle}>Raison sociale légale</span>
            <input type="text" value={details.legalName} onChange={(e) => update({ legalName: e.target.value })} style={fieldStyle} placeholder="SD Cosmétique SARL" />
          </label>
        </div>
      </div>

      <div style={sectionCard}>
        <p style={sectionTitle}>● Coordonnées</p>
        <p style={sectionSubtitle}>Téléphones, e-mail et site affichés sur la facture.</p>
        <div style={grid2}>
          <label>
            <span style={labelStyle}>Téléphone principal</span>
            <input type="text" value={details.phone} onChange={(e) => update({ phone: e.target.value })} style={fieldStyle} placeholder="+225 07 49 49 49 49" />
          </label>
          <label>
            <span style={labelStyle}>Téléphone secondaire</span>
            <input type="text" value={details.phoneSecondary} onChange={(e) => update({ phoneSecondary: e.target.value })} style={fieldStyle} />
          </label>
          <label>
            <span style={labelStyle}>WhatsApp</span>
            <input type="text" value={details.whatsapp} onChange={(e) => update({ whatsapp: e.target.value })} style={fieldStyle} />
          </label>
          <label>
            <span style={labelStyle}>E-mail</span>
            <input type="email" value={details.email} onChange={(e) => update({ email: e.target.value })} style={fieldStyle} placeholder="contact@sdcosmetique.ci" />
          </label>
          <label>
            <span style={labelStyle}>Site internet</span>
            <input type="url" value={details.website} onChange={(e) => update({ website: e.target.value })} style={fieldStyle} placeholder="https://sdcosmetique.ci" />
          </label>
        </div>
      </div>

      <div style={sectionCard}>
        <p style={sectionTitle}>● Adresse</p>
        <div style={grid2}>
          <label>
            <span style={labelStyle}>Adresse</span>
            <input type="text" value={details.address} onChange={(e) => update({ address: e.target.value })} style={fieldStyle} />
          </label>
          <label>
            <span style={labelStyle}>Ville</span>
            <input type="text" value={details.city} onChange={(e) => update({ city: e.target.value })} style={fieldStyle} />
          </label>
          <label>
            <span style={labelStyle}>Pays</span>
            <input type="text" value={details.country} onChange={(e) => update({ country: e.target.value })} style={fieldStyle} placeholder="Côte d'Ivoire" />
          </label>
        </div>
      </div>

      <div style={sectionCard}>
        <p style={sectionTitle}>● Informations légales</p>
        <p style={sectionSubtitle}>Facultatif — affichées uniquement si renseignées.</p>
        <div style={grid2}>
          <label>
            <span style={labelStyle}>RCCM</span>
            <input type="text" value={details.rccm} onChange={(e) => update({ rccm: e.target.value })} style={fieldStyle} />
          </label>
          <label>
            <span style={labelStyle}>Numéro contribuable</span>
            <input type="text" value={details.taxId} onChange={(e) => update({ taxId: e.target.value })} style={fieldStyle} />
          </label>
        </div>
      </div>

      <div style={sectionCard}>
        <p style={sectionTitle}>● Pied de page</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label>
            <span style={labelStyle}>Message de remerciement</span>
            <textarea value={details.thankYouMessage} onChange={(e) => update({ thankYouMessage: e.target.value })}
              style={{ ...fieldStyle, minHeight: '70px', resize: 'vertical' }} />
          </label>
          <label>
            <span style={labelStyle}>Conditions / remarques</span>
            <textarea value={details.terms} onChange={(e) => update({ terms: e.target.value })}
              style={{ ...fieldStyle, minHeight: '70px', resize: 'vertical' }} placeholder="Ex. : produits non repris après livraison…" />
          </label>
          <label>
            <span style={labelStyle}>Texte de pied de page libre</span>
            <textarea value={details.footerText} onChange={(e) => update({ footerText: e.target.value })}
              style={{ ...fieldStyle, minHeight: '60px', resize: 'vertical' }} />
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px 24px' }}>
        <span style={{ fontSize: '11px', color: TEXT3 }}>
          {saved ? '✓ Toutes les modifications sont enregistrées' : 'Modifications non sauvegardées'}
        </span>
        <button onClick={save} disabled={saving}
          style={{ padding: '12px 32px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', background: saved ? S_SAVE_BG : GOLD2, color: saved ? S_SAVE_T : BG }}>
          {getSaveButtonText(saved, saving)}
        </button>
      </div>
    </div>
  );
}
