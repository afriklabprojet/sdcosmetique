'use client';

/* Onglet «Marketing Bulk» (§6-§9) — campagnes e-mail groupées, distinctes des
 * messages individuels (onglet Messages) et des bannières promo (onglet
 * Marketing existant). Historique (§8), composition (§6), envoi en file
 * (§7) et désabonnement (§9) tous gérés ici. */

import React, { useEffect, useMemo, useState } from 'react';
import RichTextEditor from '@/shared/ui/rich-text.editor';
import { MarketingCampaign, Customer } from '@/shared/api/admin';
import type { CampaignDraft } from '@/shared/api/admin/marketing-campaign';
import { toast } from '@/shared/ui/toast';
import { apiErrorMessage } from '@/shared/api/client';
import type { ClientRow, MarketingCampaignRow, MarketingCampaignRecipientRow } from '@/features/admin/admin.type';
import type { MarketingAudienceType } from '@/shared/api/types';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD, GOLD2, TEXT, TEXT2, TEXT3, thStyle, tdStyle, card, inputStyle } from '@/features/admin/admin.constant';

const STATUS_LABELS: Record<MarketingCampaignRow['status'], { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: '#94A3B8' },
  scheduled: { label: 'Planifiée', color: '#60A5FA' },
  in_progress: { label: 'En cours', color: '#F59E0B' },
  completed: { label: 'Terminée', color: '#10B981' },
  failed: { label: 'Échec', color: '#EF4444' },
  cancelled: { label: 'Annulée', color: '#EF4444' },
};

const AUDIENCE_LABELS: Record<MarketingAudienceType, string> = {
  all: 'Tous les clients',
  ordered: 'Clients ayant déjà commandé',
  never_ordered: "Clients qui n'ont jamais commandé",
  active: 'Clients actifs récemment',
  inactive: 'Clients inactifs depuis longtemps',
  manual: 'Choisir les destinataires un par un',
};

const AUDIENCE_HINTS: Record<MarketingAudienceType, string> = {
  all: 'Tout le monde reçoit cet e-mail (sauf les personnes désabonnées).',
  ordered: 'Pratique pour remercier ou relancer vos acheteurs.',
  never_ordered: "Idéal pour une offre de bienvenue et convertir un premier achat.",
  active: 'A commandé au cours des 90 derniers jours — vos clients les plus engagés.',
  inactive: "N'a rien commandé depuis plus de 90 jours — pour tenter de les faire revenir.",
  manual: 'Recherchez et cochez vous-même les personnes à contacter.',
};

const RECIPIENT_STATUS_LABELS: Record<MarketingCampaignRecipientRow['status'], { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#F59E0B' },
  sent: { label: 'Envoyé', color: '#10B981' },
  failed: { label: 'Échec', color: '#EF4444' },
  skipped_unsubscribed: { label: 'Désabonné', color: '#94A3B8' },
};

const EMPTY_DRAFT: CampaignDraft = {
  name: '', subject: '', sender_name: 'SD Cosmétique', sender_email: 'contact@sdcosmetique.ci', content: '', audience_type: 'all',
};

function StatusPill({ status }: { readonly status: MarketingCampaignRow['status'] }) {
  const s = STATUS_LABELS[status];
  return <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: s.color + '15', color: s.color, border: `1px solid ${s.color}30` }}>{s.label}</span>;
}

/* ── Historique (§8) ───────────────────────────────────────────── */
function CampaignHistory({ campaigns, loading, onNew, onView, onDuplicate, onRetry, onCancel, onDelete }: {
  readonly campaigns: MarketingCampaignRow[];
  readonly loading: boolean;
  readonly onNew: () => void;
  readonly onView: (c: MarketingCampaignRow) => void;
  readonly onDuplicate: (c: MarketingCampaignRow) => void;
  readonly onRetry: (c: MarketingCampaignRow) => void;
  readonly onCancel: (c: MarketingCampaignRow) => void;
  readonly onDelete: (c: MarketingCampaignRow) => void;
}) {
  const totals = useMemo(() => ({
    sent: campaigns.reduce((s, c) => s + c.sentCount, 0),
    pending: campaigns.filter(c => c.status === 'in_progress').reduce((s, c) => s + Math.max(0, c.recipientsCount - c.sentCount - c.failedCount), 0),
    failed: campaigns.reduce((s, c) => s + c.failedCount, 0),
    inProgress: campaigns.filter(c => c.status === 'in_progress').length,
  }), [campaigns]);

  return (
    <div className="space-y-4">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="text-lg font-bold" style={{ color: TEXT }}>Marketing Bulk</h1>
          <p className="text-xs" style={{ color: TEXT3 }}>Campagnes e-mail groupées — distinctes des messages individuels.</p>
        </div>
        <button onClick={onNew} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: GOLD2, color: BG, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          + Nouvelle campagne
        </button>
      </div>

      {!loading && campaigns.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'E-mails envoyés', value: totals.sent, color: '#10B981' },
            { label: 'En attente d\'envoi', value: totals.pending, color: '#F59E0B' },
            { label: 'Échecs', value: totals.failed, color: totals.failed > 0 ? '#EF4444' : TEXT3 },
            { label: 'Campagnes en cours', value: totals.inProgress, color: totals.inProgress > 0 ? '#F59E0B' : TEXT3 },
          ].map(w => (
            <div key={w.label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 11, color: TEXT3, marginBottom: 6 }}>{w.label}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: w.color }}>{w.value}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: 24, textAlign: 'center', color: TEXT3, fontSize: 12 }}>Chargement…</p>
        ) : campaigns.length === 0 ? (
          <p style={{ padding: 24, textAlign: 'center', color: TEXT3, fontSize: 12 }}>Aucune campagne pour le moment.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead style={{ background: SURFACE2 }}>
                <tr>{['Campagne', 'Sujet', 'Destinataires', 'Envoyés', 'Échecs', 'Date', 'Statut', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{c.name}</td>
                    <td style={tdStyle}>{c.subject}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{c.recipientsCount}</td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#10B981' }}>{c.sentCount}</td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: c.failedCount > 0 ? '#EF4444' : TEXT3 }}>{c.failedCount}</td>
                    <td style={{ ...tdStyle, color: TEXT3 }}>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td style={tdStyle}><StatusPill status={c.status} /></td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button onClick={() => onView(c)} style={{ fontSize: 11, color: GOLD, background: 'transparent', border: `1px solid ${BORDER2}`, borderRadius: 6, padding: '5px 9px', cursor: 'pointer' }}>Voir</button>
                        <button onClick={() => onDuplicate(c)} style={{ fontSize: 11, color: TEXT2, background: 'transparent', border: `1px solid ${BORDER2}`, borderRadius: 6, padding: '5px 9px', cursor: 'pointer' }}>Dupliquer</button>
                        {c.failedCount > 0 && (c.status === 'completed' || c.status === 'failed') && (
                          <button onClick={() => onRetry(c)} style={{ fontSize: 11, color: '#F59E0B', background: 'transparent', border: `1px solid ${BORDER2}`, borderRadius: 6, padding: '5px 9px', cursor: 'pointer' }}>Réessayer les échecs</button>
                        )}
                        {c.status === 'in_progress' && (
                          <button onClick={() => onCancel(c)} style={{ fontSize: 11, color: '#EF4444', background: 'transparent', border: `1px solid ${BORDER2}`, borderRadius: 6, padding: '5px 9px', cursor: 'pointer' }}>Annuler</button>
                        )}
                        {c.status !== 'in_progress' && (
                          <button onClick={() => onDelete(c)} style={{ fontSize: 11, color: '#EF4444', background: 'transparent', border: `1px solid ${BORDER2}`, borderRadius: 6, padding: '5px 9px', cursor: 'pointer' }}>Supprimer</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Composition (§6) ──────────────────────────────────────────── */
function CampaignComposer({ clients, onClose, onSaved }: {
  readonly clients: ClientRow[];
  readonly onClose: () => void;
  readonly onSaved: () => void;
}) {
  const [draft, setDraft] = useState<CampaignDraft>(EMPTY_DRAFT);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [manualSearch, setManualSearch] = useState('');
  const [manualSelected, setManualSelected] = useState<Set<string>>(new Set());

  const manualResults = useMemo(() => {
    if (manualSearch.trim().length === 0) return clients.slice(0, 30);
    const q = manualSearch.trim().toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 30);
  }, [clients, manualSearch]);

  useEffect(() => {
    let cancelled = false;
    const ids = draft.audience_type === 'manual' ? Array.from(manualSelected) : undefined;
    MarketingCampaign.audienceCount(draft.audience_type, ids)
      .then((count) => { if (!cancelled) setRecipientCount(count); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [draft.audience_type, manualSelected]);

  const update = (patch: Partial<CampaignDraft>) => setDraft(d => ({ ...d, ...patch }));

  const save = async (): Promise<string | null> => {
    if (!draft.name.trim() || !draft.subject.trim() || !draft.content.trim()) {
      toast.error('Nom, sujet et contenu sont obligatoires.');
      return null;
    }
    setSaving(true);
    try {
      const payload: CampaignDraft = {
        ...draft,
        audience_client_ids: draft.audience_type === 'manual' ? Array.from(manualSelected) : undefined,
      };
      const result = campaignId ? await MarketingCampaign.update(campaignId, payload) : await MarketingCampaign.create(payload);
      setCampaignId(result.id);
      toast.success('Brouillon enregistré.');
      return result.id;
    } catch (err) {
      toast.error(apiErrorMessage(err, "Erreur lors de l'enregistrement de la campagne."));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const preview = async () => {
    const id = campaignId ?? await save();
    if (!id) return;
    window.open(MarketingCampaign.previewUrl(id), '_blank');
  };

  const sendTest = async () => {
    if (!testEmail.trim()) { toast.error('Indiquez une adresse de test.'); return; }
    const id = campaignId ?? await save();
    if (!id) return;
    setSendingTest(true);
    try {
      await MarketingCampaign.sendTest(id, testEmail.trim());
      toast.success(`Test envoyé à ${testEmail.trim()}.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Erreur lors de l'envoi du test."));
    } finally {
      setSendingTest(false);
    }
  };

  const sendCampaign = async () => {
    const id = campaignId ?? await save();
    if (!id) return;
    if (!window.confirm(`Envoyer cette campagne à ${recipientCount ?? '…'} destinataire(s) ? Cette action est irréversible.`)) return;
    setSending(true);
    try {
      await MarketingCampaign.send(id);
      toast.success('Campagne en cours d\'envoi.');
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Erreur lors de l'envoi de la campagne."));
    } finally {
      setSending(false);
    }
  };

  const labelStyle = { fontSize: '11px', color: TEXT2, marginBottom: '6px', display: 'block' as const, fontWeight: 600 };
  const sectionCard = { background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '20px 22px', marginBottom: '16px' };

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 className="text-lg font-bold" style={{ color: TEXT }}>Nouvelle campagne</h1>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: TEXT3, fontSize: 12, cursor: 'pointer' }}>← Retour à l&apos;historique</button>
      </div>

      <div style={{ background: 'rgba(200,151,74,0.08)', border: `1px solid ${BORDER2}`, borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: 12, color: TEXT2, lineHeight: 1.6 }}>
        💡 <strong style={{ color: TEXT }}>Comment ça marche :</strong> 1) Rédigez votre e-mail ci-dessous. 2) Choisissez qui doit le recevoir.
        3) Cliquez sur <em>Prévisualiser</em> pour voir le rendu final, ou <em>Envoyer un test</em> pour le recevoir vous-même. 4) Quand tout est prêt, cliquez sur <em>Envoyer la campagne</em> — irréversible, donc testez d&apos;abord !
      </div>

      <div style={sectionCard}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
          <label>
            <span style={labelStyle}>Nom de la campagne</span>
            <input type="text" value={draft.name} onChange={e => update({ name: e.target.value })} style={inputStyle} placeholder="Promo rentrée" />
          </label>
          <label>
            <span style={labelStyle}>Sujet de l&apos;e-mail</span>
            <input type="text" value={draft.subject} onChange={e => update({ subject: e.target.value })} style={inputStyle} placeholder="-20% sur toute la gamme" />
          </label>
          <label>
            <span style={labelStyle}>Nom expéditeur</span>
            <input type="text" value={draft.sender_name} onChange={e => update({ sender_name: e.target.value })} style={inputStyle} />
          </label>
          <label>
            <span style={labelStyle}>E-mail expéditeur</span>
            <input type="email" value={draft.sender_email} onChange={e => update({ sender_email: e.target.value })} style={inputStyle} />
          </label>
        </div>
        <div>
          <span style={labelStyle}>Contenu</span>
          <RichTextEditor value={draft.content} onChange={(html) => update({ content: html })} placeholder="Rédigez votre campagne…" minHeight={220} allowImages />
        </div>
      </div>

      <div style={sectionCard}>
        <p style={{ ...labelStyle, marginBottom: 2 }}>Qui doit recevoir cette campagne ?</p>
        <p style={{ fontSize: 11, color: TEXT3, marginBottom: 12 }}>Choisissez un groupe — le nombre de personnes concernées s&apos;affiche automatiquement plus bas.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {(Object.keys(AUDIENCE_LABELS) as MarketingAudienceType[]).map((type) => (
            <label key={type} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: TEXT, cursor: 'pointer' }}>
              <input type="radio" name="audience" checked={draft.audience_type === type} onChange={() => update({ audience_type: type })} style={{ marginTop: 3 }} />
              <span>
                <span style={{ display: 'block', fontWeight: 600 }}>{AUDIENCE_LABELS[type]}</span>
                <span style={{ display: 'block', fontSize: 11, color: TEXT3, marginTop: 2 }}>{AUDIENCE_HINTS[type]}</span>
              </span>
            </label>
          ))}
        </div>

        {draft.audience_type === 'manual' && (
          <div style={{ background: BG, border: `1px solid ${BORDER2}`, borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <input type="search" value={manualSearch} onChange={e => setManualSearch(e.target.value)} placeholder="Rechercher nom, e-mail…" style={{ ...inputStyle, flex: 1, minWidth: 160 }} />
              <button onClick={() => setManualSelected(new Set(clients.map(c => c.id)))} style={{ fontSize: 11, color: TEXT2, background: 'transparent', border: `1px solid ${BORDER2}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>Tout sélectionner</button>
              <button onClick={() => setManualSelected(new Set())} style={{ fontSize: 11, color: TEXT2, background: 'transparent', border: `1px solid ${BORDER2}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>Tout désélectionner</button>
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {manualResults.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: TEXT, padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={manualSelected.has(c.id)} onChange={(e) => {
                    setManualSelected(prev => {
                      const next = new Set(prev);
                      if (e.target.checked) next.add(c.id); else next.delete(c.id);
                      return next;
                    });
                  }} />
                  {c.name} <span style={{ color: TEXT3 }}>— {c.email}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '10px 14px', background: 'rgba(200,151,74,0.1)', border: `1px solid ${BORDER2}`, borderRadius: 8, fontSize: 13, fontWeight: 700, color: GOLD }}>
          Nombre de destinataires : {recipientCount ?? '…'}
        </div>
      </div>

      <div style={sectionCard}>
        <p style={{ ...labelStyle, marginBottom: 10 }}>Avant l&apos;envoi</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <button onClick={preview} disabled={saving} style={{ padding: '9px 16px', borderRadius: 8, border: `1px solid ${BORDER2}`, background: 'transparent', color: TEXT, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Prévisualiser
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="Adresse pour l'envoi test" style={{ ...inputStyle, maxWidth: 260 }} />
          <button onClick={sendTest} disabled={sendingTest} style={{ padding: '9px 16px', borderRadius: 8, border: `1px solid ${BORDER2}`, background: 'transparent', color: TEXT, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {sendingTest ? 'Envoi…' : 'Envoyer un test'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button onClick={() => void save()} disabled={saving} style={{ padding: '11px 20px', borderRadius: 10, border: `1px solid ${BORDER2}`, background: 'transparent', color: TEXT2, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {saving ? 'Enregistrement…' : 'Enregistrer le brouillon'}
        </button>
        <button onClick={sendCampaign} disabled={sending}
          style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: GOLD2, color: BG, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: sending ? 0.6 : 1 }}>
          {sending ? 'Envoi…' : 'Envoyer la campagne'}
        </button>
      </div>
    </div>
  );
}

/* ── Détail d'une campagne ("Voir") ────────────────────────────── */
function CampaignDetail({ campaign, onClose, onRetried }: {
  readonly campaign: MarketingCampaignRow;
  readonly onClose: () => void;
  readonly onRetried: () => void;
}) {
  const [recipients, setRecipients] = useState<MarketingCampaignRecipientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    MarketingCampaign.recipients(campaign.id).then(setRecipients).catch(() => toast.error('Impossible de charger les destinataires.')).finally(() => setLoading(false));
  }, [campaign.id]);

  const [cancelling, setCancelling] = useState(false);

  const retry = async () => {
    setRetrying(true);
    try {
      await MarketingCampaign.retryFailed(campaign.id);
      toast.success('Relance des échecs lancée.');
      onRetried();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Erreur lors de la relance.'));
    } finally {
      setRetrying(false);
    }
  };

  const cancel = async () => {
    if (!window.confirm('Annuler cette campagne ? Les e-mails déjà envoyés ne peuvent pas être rappelés, mais ceux restants ne partiront pas.')) return;
    setCancelling(true);
    try {
      await MarketingCampaign.cancel(campaign.id);
      toast.success('Campagne annulée.');
      onRetried();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Erreur lors de l'annulation."));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="text-lg font-bold" style={{ color: TEXT }}>{campaign.name}</h1>
          <p className="text-xs" style={{ color: TEXT3 }}>{campaign.subject}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: TEXT3, fontSize: 12, cursor: 'pointer' }}>← Retour à l&apos;historique</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Statut', value: <StatusPill status={campaign.status} /> },
          { label: 'Destinataires', value: campaign.recipientsCount },
          { label: 'Envoyés', value: campaign.sentCount },
          { label: 'Échecs', value: campaign.failedCount },
        ].map(w => (
          <div key={w.label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: TEXT3, textTransform: 'uppercase', marginBottom: 6 }}>{w.label}</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: GOLD }}>{w.value}</p>
          </div>
        ))}
      </div>

      {campaign.status === 'in_progress' && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: TEXT3, marginBottom: 6 }}>
            <span>Envoi en cours…</span>
            <span>{campaign.sentCount + campaign.failedCount} / {campaign.recipientsCount}</span>
          </div>
          <div style={{ height: 8, background: SURFACE2, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${campaign.recipientsCount > 0 ? Math.round(((campaign.sentCount + campaign.failedCount) / campaign.recipientsCount) * 100) : 0}%`,
              background: '#F59E0B',
              transition: 'width .3s ease',
            }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {campaign.failedCount > 0 && (campaign.status === 'completed' || campaign.status === 'failed') && (
          <button onClick={retry} disabled={retrying} style={{ padding: '9px 16px', borderRadius: 8, border: `1px solid ${BORDER2}`, background: 'transparent', color: '#F59E0B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {retrying ? 'Relance…' : 'Réessayer les échecs'}
          </button>
        )}
        {campaign.status === 'in_progress' && (
          <button onClick={cancel} disabled={cancelling} style={{ padding: '9px 16px', borderRadius: 8, border: `1px solid ${BORDER2}`, background: 'transparent', color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {cancelling ? 'Annulation…' : 'Annuler la campagne'}
          </button>
        )}
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: 24, textAlign: 'center', color: TEXT3, fontSize: 12 }}>Chargement…</p>
        ) : recipients.length === 0 ? (
          <p style={{ padding: 24, textAlign: 'center', color: TEXT3, fontSize: 12 }}>Aucun destinataire.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead style={{ background: SURFACE2 }}>
                <tr>{['Client', 'E-mail', 'Statut'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {recipients.map(r => {
                  const s = RECIPIENT_STATUS_LABELS[r.status];
                  return (
                    <tr key={r.id}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{r.clientName ?? `Client #${r.clientId}`}</td>
                      <td style={{ ...tdStyle, color: TEXT3 }}>{r.email}</td>
                      <td style={tdStyle}><span style={{ padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: s.color + '15', color: s.color, border: `1px solid ${s.color}30` }}>{s.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Onglet racine ──────────────────────────────────────────────── */
export default function MarketingBulkTab() {
  const [view, setView] = useState<'list' | 'compose' | 'detail'>('list');
  const [campaigns, setCampaigns] = useState<MarketingCampaignRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MarketingCampaignRow | null>(null);

  const reload = () => {
    MarketingCampaign.list().then(setCampaigns).catch(() => toast.error('Impossible de charger les campagnes.')).finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    Customer.list().then(setClients).catch(() => {});
  }, []);

  const duplicate = async (c: MarketingCampaignRow) => {
    try {
      await MarketingCampaign.duplicate(c.id);
      toast.success('Campagne dupliquée en brouillon.');
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Erreur lors de la duplication.'));
    }
  };

  const retry = async (c: MarketingCampaignRow) => {
    try {
      await MarketingCampaign.retryFailed(c.id);
      toast.success('Relance des échecs lancée.');
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Erreur lors de la relance.'));
    }
  };

  const cancel = async (c: MarketingCampaignRow) => {
    if (!window.confirm(`Annuler la campagne « ${c.name} » ? Les e-mails déjà envoyés ne peuvent pas être rappelés.`)) return;
    try {
      await MarketingCampaign.cancel(c.id);
      toast.success('Campagne annulée.');
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Erreur lors de l'annulation."));
    }
  };

  const discard = async (c: MarketingCampaignRow) => {
    if (!window.confirm(`Supprimer définitivement la campagne « ${c.name} » ?`)) return;
    try {
      await MarketingCampaign.discard(c.id);
      toast.success('Campagne supprimée.');
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Erreur lors de la suppression.'));
    }
  };

  if (view === 'compose') {
    return <CampaignComposer clients={clients} onClose={() => { setView('list'); reload(); }} onSaved={() => { setView('list'); reload(); }} />;
  }

  if (view === 'detail' && selected) {
    return <CampaignDetail campaign={selected} onClose={() => { setView('list'); reload(); }} onRetried={() => { setView('list'); reload(); }} />;
  }

  return (
    <CampaignHistory
      campaigns={campaigns}
      loading={loading}
      onNew={() => setView('compose')}
      onView={(c) => { setSelected(c); setView('detail'); }}
      onDuplicate={duplicate}
      onRetry={retry}
      onCancel={cancel}
      onDelete={discard}
    />
  );
}
