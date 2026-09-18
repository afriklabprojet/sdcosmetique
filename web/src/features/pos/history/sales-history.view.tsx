'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Session, Pos } from '@/shared/api/admin';
import type { PosSale, PosSaleFilters, PosSalesSummary } from '@/shared/api/admin/pos';
import { toast } from '@/shared/ui/toast';
import { formatPrice } from '@/shared/format/price';
import RefundModal from '@/features/pos/history/refund.modal';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3, S_OK_BG, S_OK_T, S_ERR_BG, S_ERR_T, S_WARN_BG, S_WARN_T } from '@/features/admin/admin.constant';

const WIDGETS: { key: keyof PosSalesSummary; label: string }[] = [
  { key: 'today', label: 'Ventes aujourd’hui' },
  { key: 'week', label: 'Cette semaine' },
  { key: 'month', label: 'Ce mois' },
  { key: 'all_time', label: 'Total cumulé' },
];

export default function SalesHistoryView() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [canRefund, setCanRefund] = useState(false);
  const [cashierName, setCashierName] = useState<string | null>(null);

  const [sales, setSales] = useState<PosSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PosSaleFilters>({});
  const [refundTarget, setRefundTarget] = useState<PosSale | null>(null);
  const [summary, setSummary] = useState<PosSalesSummary | null>(null);

  useEffect(() => {
    Session.fetch()
      .then((s) => {
        setCanRefund(s.admin.role !== 'cashier');
        if (s.admin.role === 'cashier') setCashierName(s.user.name);
      })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setChecking(false));
  }, [router]);

  const load = useCallback(() => {
    setLoading(true);
    Pos.sales(filters)
      .then((res) => setSales(res.data))
      .catch(() => toast.error('Impossible de charger l’historique.'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- charge l'historique une fois l'authentification confirmée
    if (!checking) load();
  }, [checking, load]);

  useEffect(() => {
    if (!checking) Pos.salesSummary().then(setSummary).catch(() => toast.error('Impossible de charger les statistiques.'));
  }, [checking]);

  if (checking) return null;

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: TEXT, margin: 0 }}>
          {cashierName ? `Mes ventes — ${cashierName}` : 'Historique des ventes caisse'}
        </h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => window.open(Pos.salesExportUrl('pdf', filters), '_blank')}
            style={{ padding: '10px 16px', border: `1px solid ${BORDER2}`, borderRadius: '8px', background: 'none', color: TEXT, fontSize: '13px', cursor: 'pointer' }}>
            Exporter PDF
          </button>
          <button type="button" onClick={() => window.open(Pos.salesExportUrl('csv', filters), '_blank')}
            style={{ padding: '10px 16px', border: `1px solid ${BORDER2}`, borderRadius: '8px', background: 'none', color: TEXT, fontSize: '13px', cursor: 'pointer' }}>
            Exporter Excel (CSV)
          </button>
          <Link href="/admin/pos" style={{ padding: '10px 16px', border: `1px solid ${BORDER2}`, borderRadius: '8px', color: GOLD, fontSize: '13px', textDecoration: 'none' }}>
            ← Retour à la caisse
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {WIDGETS.map(({ key, label }) => (
          <div key={key} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '16px 18px' }}>
            <div style={{ fontSize: '11px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: TEXT }}>{summary ? formatPrice(summary[key].revenue) : '—'}</div>
            <div style={{ fontSize: '12px', color: TEXT2, marginTop: '4px' }}>{summary ? `${summary[key].sales_count} vente${summary[key].sales_count > 1 ? 's' : ''}` : ''}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <input
          placeholder="Référence…"
          value={filters.reference ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, reference: e.target.value }))}
          style={{ background: SURFACE, border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '10px 12px', fontSize: '13px' }}
        />
        <select
          value={filters.status ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
          style={{ background: SURFACE, border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '10px 12px', fontSize: '13px' }}
        >
          <option value="">Tous statuts</option>
          <option value="paid">Payées</option>
          <option value="refunded">Remboursées</option>
        </select>
        <input type="date" value={filters.from ?? ''} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))}
          style={{ background: SURFACE, border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '10px 12px', fontSize: '13px' }} />
        <input type="date" value={filters.to ?? ''} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))}
          style={{ background: SURFACE, border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, padding: '10px 12px', fontSize: '13px' }} />
      </div>

      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {['N°', 'Date', 'Client', 'Vendeur', 'Total', 'Statut', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: TEXT3, fontSize: '11px', textTransform: 'uppercase', borderBottom: `1px solid ${BORDER}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ padding: '20px', color: TEXT2 }}>Chargement…</td></tr>
            )}
            {!loading && sales.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '20px', color: TEXT2 }}>Aucune vente.</td></tr>
            )}
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td style={{ padding: '10px 14px', color: TEXT, borderBottom: `1px solid ${SURFACE2}` }}>{sale.reference}</td>
                <td style={{ padding: '10px 14px', color: TEXT2, borderBottom: `1px solid ${SURFACE2}` }}>{new Date(sale.placed_at).toLocaleString('fr-FR')}</td>
                <td style={{ padding: '10px 14px', color: TEXT2, borderBottom: `1px solid ${SURFACE2}` }}>{sale.customer.name}</td>
                <td style={{ padding: '10px 14px', color: TEXT2, borderBottom: `1px solid ${SURFACE2}` }}>{sale.cashier ?? '—'}</td>
                <td style={{ padding: '10px 14px', color: TEXT, fontWeight: 700, borderBottom: `1px solid ${SURFACE2}` }}>{formatPrice(sale.total)}</td>
                <td style={{ padding: '10px 14px', borderBottom: `1px solid ${SURFACE2}` }}>
                  {sale.status !== 'paid' ? (
                    <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: S_WARN_BG, color: S_WARN_T }}>
                      En attente
                    </span>
                  ) : (
                    <span style={{
                      padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                      background: sale.refund_status === 'full' ? S_ERR_BG : sale.refund_status === 'partial' ? S_WARN_BG : S_OK_BG,
                      color: sale.refund_status === 'full' ? S_ERR_T : sale.refund_status === 'partial' ? S_WARN_T : S_OK_T,
                    }}>
                      {sale.refund_status === 'full' ? 'Remboursée' : sale.refund_status === 'partial' ? 'Partiellement remboursée' : 'Payée'}
                    </span>
                  )}
                </td>
                <td style={{ padding: '10px 14px', borderBottom: `1px solid ${SURFACE2}`, textAlign: 'right' }}>
                  {sale.status === 'paid' && (
                    <button type="button" onClick={() => window.open(Pos.receiptPdfUrl(sale.id, 'a4'), '_blank')}
                      style={{ background: 'none', border: 'none', color: GOLD, fontSize: '12px', cursor: 'pointer', marginRight: '10px' }}>
                      Reçu
                    </button>
                  )}
                  {canRefund && sale.status === 'paid' && sale.refund_status !== 'full' && (
                    <button type="button" onClick={() => setRefundTarget(sale)}
                      style={{ background: 'none', border: 'none', color: '#E07A7A', fontSize: '12px', cursor: 'pointer' }}>
                      Rembourser
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {refundTarget && (
        <RefundModal
          sale={refundTarget}
          onCancel={() => setRefundTarget(null)}
          onRefunded={() => { setRefundTarget(null); load(); }}
        />
      )}
    </div>
  );
}
