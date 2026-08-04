'use client';

/*
 * Onglet «dashboard» de la console d'administration. Il etait declare au
 * niveau module dans `admin.view.tsx` ; la vague `split` (F-110) lui donne son
 * fichier. Sa surface de props ne bouge pas : elle a ete fixee en vague
 * `boundary`.
 */

import React from 'react';
import StatusBadge from '@/features/admin/badges/status.badge';
import { type EditableProduct, type ReviewRow, type Tab } from '@/features/admin/admin.type';
import { formatPrice } from '@/features/catalog/product.query';
import { formatOrderDate, type OrderDraft } from '@/features/orders/order.store';
import { SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT2, TEXT3, TITLE, S_ERR_T, S_OK_T, S_WARN_T, S_INFO_T, GOLD_D, ACCENT_P, ACCENT_Y, STATUS_OPTIONS } from '@/features/admin/admin.constant';

interface DashboardTabProps {
  orders: OrderDraft[];
  editableProducts: EditableProduct[];
  reviews: ReviewRow[];
  totalRevenue: number;
  revenueThisMonth: number;
  ordersInProgress: number;
  recentOrders: OrderDraft[];
  last7Days: { label: string; value: number }[];
  maxDay: number;
  onNavigate: (tab: Tab) => void;
  onOpenDetail: (order: OrderDraft) => void;
  thStyle: React.CSSProperties;
  tdStyle: React.CSSProperties;
}

export function DashboardTab({ 
  orders, editableProducts, reviews, totalRevenue, revenueThisMonth, 
  ordersInProgress, recentOrders, last7Days, maxDay, 
  onNavigate, onOpenDetail, thStyle, tdStyle 
}: Readonly<DashboardTabProps>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: TITLE, letterSpacing: '-0.02em' }}>Tableau de bord</h1>
          <p style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button onClick={() => onNavigate('commandes')} style={{ fontSize: '11px', padding: '7px 14px', borderRadius: '8px', border: `1px solid ${BORDER2}`, background: SURFACE2, color: TEXT2, cursor: 'pointer' }}>Toutes les commandes →</button>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Chiffre d\'affaires', value: formatPrice(totalRevenue), sub: 'Toutes commandes', pct: 100, icon: '◈', color: GOLD },
          { label: 'CA ce mois', value: formatPrice(revenueThisMonth), sub: new Date().toLocaleDateString('fr-FR', { month: 'long' }), pct: totalRevenue > 0 ? Math.round((revenueThisMonth / totalRevenue) * 100) : 0, icon: '▲', color: S_OK_T },
          { label: 'Commandes totales', value: String(orders.length), sub: 'Depuis le début', pct: 100, icon: '◫', color: S_INFO_T },
          { label: 'En attente', value: String(ordersInProgress), sub: ordersInProgress > 0 ? 'À traiter' : 'Tout est traité ✓', pct: orders.length > 0 ? Math.round((ordersInProgress / orders.length) * 100) : 0, icon: '⏳', color: S_ERR_T },
          { label: 'Produits', value: String(editableProducts.length), sub: 'Dans le catalogue', pct: 100, icon: '◇', color: ACCENT_P },
          { label: 'Avis clients', value: String(reviews.length), sub: `${reviews.filter(r => r.verified).length} vérifiés`, pct: reviews.length > 0 ? Math.round((reviews.filter(r => r.verified).length / reviews.length) * 100) : 0, icon: '★', color: ACCENT_Y },
          ...(() => {
            const tracked = editableProducts.filter(p => p.stockQty != null);
            const lowTracked = tracked.filter(p => (p.stockQty ?? 0) > 0 && (p.stockQty ?? 0) <= (p.lowStockThreshold ?? 5)).length;
            const outTracked = tracked.filter(p => (p.stockQty ?? 0) <= 0).length;
            // Produits sans suivi de quantité mais marqués hors stock (in_stock = false)
            const outUntracked = editableProducts.filter(p => p.stockQty == null && p.inStock === false).length;
            const out = outTracked + outUntracked;
            const low = lowTracked;
            const total = editableProducts.length;
            return [{ label: 'Stock à surveiller', value: String(low + out), sub: out > 0 ? `${out} en rupture` : `${low} stock bas`, pct: total > 0 ? Math.round(((low + out) / total) * 100) : 0, icon: '◰', color: out > 0 ? S_ERR_T : S_WARN_T }];
          })(),
        ].map(kpi => (
          <div key={kpi.label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${kpi.color}55, ${kpi.color}22)` }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{kpi.label}</span>
              <span style={{ fontSize: '16px', opacity: .7 }}>{kpi.icon}</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: TITLE, letterSpacing: '-0.02em', marginBottom: '4px' }}>{kpi.value}</div>
            <div style={{ fontSize: '11px', color: TEXT3, marginBottom: '12px' }}>{kpi.sub}</div>
            <div style={{ height: '3px', background: SURFACE2, borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(kpi.pct, 100)}%`, background: kpi.color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Recent orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Bar chart — CA 7 derniers jours */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: TITLE }}>CA — 7 derniers jours</h2>
              <p style={{ fontSize: '11px', color: TEXT3, marginTop: '2px' }}>Évolution des ventes</p>
            </div>
            <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(200,151,74,0.1)', color: GOLD, fontWeight: 600 }}>7j</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px' }}>
            {last7Days.map((d, i) => (
              <div key={`chart-bar-${d.label}-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '100%', height: `${(() => {
                  if (maxDay <= 0) return '2px';
                  const ratio = d.value / maxDay;
                  const calculatedHeight = Math.round(ratio * 80);
                  return d.value > 0 ? Math.max(calculatedHeight, 6) + 'px' : '2px';
                })()}`, background: d.value > 0 ? `linear-gradient(180deg, ${GOLD}, ${GOLD_D})` : SURFACE2, borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease', cursor: 'default' }} title={d.value > 0 ? formatPrice(d.value) : '0'} />
                <span style={{ color: TEXT3, fontSize: '9px', fontWeight: 500 }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats rapides */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 600, color: TITLE }}>Statuts des commandes</h2>
          {STATUS_OPTIONS.map(s => {
            const count = orders.filter(o => o.status === s.value).length;
            const pct   = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
            return (
              <div key={s.value} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: TEXT2 }}>{s.label}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: s.color }}>{count}</span>
                </div>
                <div style={{ height: '3px', background: SURFACE2, borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: s.bg, borderRadius: '2px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dernières commandes */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
          <h2 style={{ fontSize: '13px', fontWeight: 600, color: TITLE }}>Dernières commandes</h2>
          <button onClick={() => onNavigate('commandes')} style={{ fontSize: '11px', color: GOLD, background: 'none', border: 'none', cursor: 'pointer' }}>Voir tout →</button>
        </div>
        {recentOrders.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px', fontSize: '12px', color: TEXT3 }}>Aucune commande enregistrée.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: SURFACE2 }}>
                <tr>{['N° commande', 'Date', 'Client', 'Total', 'Statut'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.orderNumber} style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = SURFACE2)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => onOpenDetail(o)}>
                    <td style={tdStyle}><span style={{ color: GOLD, fontWeight: 600 }}>{o.orderNumber}</span></td>
                    <td style={tdStyle}>{formatOrderDate(o.date)}</td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{o.delivery.firstName} {o.delivery.lastName}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: GOLD }}>{formatPrice(o.total)}</td>
                    <td style={tdStyle}><StatusBadge status={o.status} /></td>
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
