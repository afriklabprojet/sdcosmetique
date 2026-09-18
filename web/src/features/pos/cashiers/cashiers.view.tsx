'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pos, Session } from '@/shared/api/admin';
import type { PosCashier, PosCashierInput } from '@/shared/api/admin/pos';
import { apiErrorMessage } from '@/shared/api/client';
import { toast } from '@/shared/ui/toast';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3, S_ERR_BG, S_ERR_T, S_OK_BG, S_OK_T, S_WARN_BG, S_WARN_T } from '@/features/admin/admin.constant';

const EMPTY_FORM: PosCashierInput = { name: '', email: '', password: '', password_confirmation: '', active: true };

export default function CashiersView() {
  const router = useRouter();
  const [cashiers, setCashiers] = useState<PosCashier[]>([]);
  const [form, setForm] = useState<PosCashierInput>(EMPTY_FORM);
  const [editing, setEditing] = useState<PosCashier | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    Pos.cashiers()
      .then(setCashiers)
      .catch((error) => toast.error(apiErrorMessage(error, 'Impossible de charger les caissières.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Session.fetch()
      .then((session) => {
        if (!session.admin.root && session.admin.role !== 'admin' && session.admin.role !== 'super_admin') {
          router.replace('/admin/pos');
          return;
        }
        load();
      })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setChecking(false));
  }, [router]);

  const beginEdit = (cashier: PosCashier) => {
    setEditing(cashier);
    setForm({ name: cashier.name, email: cashier.email, password: '', password_confirmation: '', active: cashier.active });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (editing) await Pos.updateCashier(editing.id, form);
      else await Pos.createCashier(form);
      toast.success(editing ? 'Compte caissière mis à jour.' : 'Compte caissière créé.');
      resetForm();
      load();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Impossible d'enregistrer ce compte."));
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (cashier: PosCashier) => {
    if (!window.confirm(`Désactiver le compte de ${cashier.name} ?`)) return;
    try {
      await Pos.deactivateCashier(cashier.id);
      toast.success('Compte caissière désactivé.');
      load();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Impossible de désactiver ce compte.'));
    }
  };

  if (checking) return null;

  return (
    <main style={{ minHeight: '100vh', background: BG, color: TEXT, padding: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <div>
          <p style={{ margin: '0 0 6px', color: GOLD, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Point de vente</p>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Équipe de caisse</h1>
        </div>
        <Link href="/admin" style={{ color: TEXT2, border: `1px solid ${BORDER2}`, borderRadius: '8px', padding: '10px 14px', textDecoration: 'none', fontSize: '13px' }}>
          Retour à l’administration
        </Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '24px', alignItems: 'start' }}>
        <form onSubmit={submit} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ margin: '0 0 18px', fontSize: '16px' }}>{editing ? 'Modifier la caissière' : 'Nouvelle caissière'}</h2>
          <Field label="Nom complet" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} autoComplete="name" required />
          <Field label="Email personnel" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} autoComplete="email" required />
          <Field label={editing ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'} type="password" value={form.password ?? ''} onChange={(password) => setForm((current) => ({ ...current, password }))} autoComplete="new-password" required={!editing} />
          <Field label="Confirmer le mot de passe" type="password" value={form.password_confirmation ?? ''} onChange={(password_confirmation) => setForm((current) => ({ ...current, password_confirmation }))} autoComplete="new-password" required={!editing || Boolean(form.password)} />
          {editing && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: TEXT2, fontSize: '13px', marginBottom: '18px' }}>
              <input type="checkbox" checked={form.active ?? true} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
              Compte actif
            </label>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            {editing && <button type="button" onClick={resetForm} style={secondaryButton}>Annuler</button>}
            <button type="submit" disabled={busy} style={{ flex: 1, padding: '12px', border: 0, borderRadius: '8px', background: GOLD, color: '#1A0E05', fontWeight: 800, cursor: busy ? 'wait' : 'pointer' }}>
              {busy ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Créer le compte'}
            </button>
          </div>
        </form>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '16px' }}>Comptes caissières</h2>
            <span style={{ color: TEXT3, fontSize: '12px' }}>{cashiers.length} compte{cashiers.length > 1 ? 's' : ''}</span>
          </div>
          {loading ? <p style={{ color: TEXT2 }}>Chargement…</p> : cashiers.length === 0 ? (
            <div style={{ padding: '24px', border: `1px solid ${BORDER}`, borderRadius: '8px', color: TEXT2 }}>Aucune caissière enregistrée.</div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {cashiers.map((cashier) => (
                <article key={cashier.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '16px' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '3px' }}>{cashier.name}</strong>
                    <span style={{ color: TEXT2, fontSize: '12px' }}>{cashier.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {cashier.has_open_session && <Status text="Caisse ouverte" bg={S_WARN_BG} color={S_WARN_T} />}
                    <Status text={cashier.active ? 'Active' : 'Désactivée'} bg={cashier.active ? S_OK_BG : S_ERR_BG} color={cashier.active ? S_OK_T : S_ERR_T} />
                    <button type="button" onClick={() => beginEdit(cashier)} style={secondaryButton}>Modifier</button>
                    {cashier.active && <button type="button" onClick={() => void deactivate(cashier)} disabled={cashier.has_open_session} title={cashier.has_open_session ? 'Fermez sa caisse avant de désactiver le compte.' : undefined} style={{ ...secondaryButton, color: S_ERR_T, opacity: cashier.has_open_session ? 0.45 : 1 }}>Désactiver</button>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = 'text', autoComplete, required = false }: Readonly<{ label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete: string; required?: boolean }>) {
  return (
    <label style={{ display: 'block', color: TEXT3, fontSize: '12px', marginBottom: '14px' }}>
      <span style={{ display: 'block', marginBottom: '6px' }}>{label}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} style={{ width: '100%', padding: '11px 12px', background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '6px', color: TEXT, fontSize: '14px' }} />
    </label>
  );
}

function Status({ text, bg, color }: Readonly<{ text: string; bg: string; color: string }>) {
  return <span style={{ padding: '5px 8px', borderRadius: '999px', background: bg, color, fontSize: '11px', fontWeight: 700 }}>{text}</span>;
}

const secondaryButton: React.CSSProperties = { padding: '9px 11px', background: 'none', border: `1px solid ${BORDER2}`, borderRadius: '6px', color: TEXT2, fontSize: '12px', cursor: 'pointer' };