'use client';

/*
 * Onglet «commandes» de la console d'administration. Il etait declare au
 * niveau module dans `admin.view.tsx` ; la vague `split` (F-110) lui donne son
 * fichier. Sa surface de props ne bouge pas : elle a ete fixee en vague
 * `boundary`.
 */

import React, { useMemo, useState } from 'react';
import Pagination from '@/features/admin/pagination';
import { filterOrdersData, paginateData } from '@/features/admin/admin-metrics';
import { type OrderStatus } from '@/features/admin/admin.type';
import { formatPrice } from '@/features/catalog/product.query';
import { formatOrderDate, type OrderDraft } from '@/features/orders/order.store';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT3, TITLE, INFO_C, PER_PAGE, STATUS_OPTIONS, PAYMENT_LABELS } from '@/features/admin/admin.constant';

interface OrdersTabProps {
  orders: OrderDraft[];
  openDetail: (order: OrderDraft) => void;
  changeStatus: (orderNumber: string, status: OrderStatus) => void;
  /** Encaissement d'une commande payee a la livraison. */
  markPaid: (orderNumber: string) => void;
  thStyle: React.CSSProperties;
  tdStyle: React.CSSProperties;
}

/* Etat financier affiche a part du statut logistique : une commande peut etre
 * « confirmee » et pas encore payee, l'admin doit voir les deux. */
const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'En attente',  color: '#F59E0B' },
  processing: { label: 'En cours',    color: '#F59E0B' },
  paid:       { label: 'Payée',       color: '#10B981' },
  failed:     { label: 'Échouée',     color: '#EF4444' },
  refunded:   { label: 'Remboursée',  color: '#6B7280' },
};

/* Meme lecture que ProductsTab : recherche, statut filtre et page ne sortaient
 * de l'onglet que pour y revenir sous forme de liste paginee. */
export function OrdersTab({
  orders, openDetail, changeStatus, markPaid, thStyle, tdStyle
}: Readonly<OrdersTabProps>) {
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderPage, setOrderPage] = useState(1);

  const filteredOrders = useMemo(
    () => filterOrdersData(orders, orderSearchTerm, orderStatusFilter),
    [orders, orderSearchTerm, orderStatusFilter],
  );
  const orderPageCount = Math.max(1, Math.ceil(filteredOrders.length / PER_PAGE));
  const pagedOrders = paginateData(filteredOrders, orderPage, PER_PAGE).pagedData;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-lg font-bold" style={{ color: TITLE }}>
          Commandes ({filteredOrders.length})
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <input 
            type="search" 
            value={orderSearchTerm}
            onChange={e => setOrderSearchTerm(e.target.value)}
            placeholder="Recherche client, commande..."
            className="text-xs px-3 py-1.5 rounded border" 
            style={{ background: SURFACE, borderColor: BORDER2, color: TEXT, width: '200px' }}
          />
          <select
            aria-label="Filtrer par statut de commande"
            value={orderStatusFilter}
            onChange={e => setOrderStatusFilter(e.target.value)}
            className="text-xs px-2 py-1.5 rounded border"
            style={{ background: SURFACE, borderColor: BORDER2, color: TEXT }}
          >
            <option value="">Tous les statuts</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          background: SURFACE, 
          border: `1px solid ${BORDER}`, 
          borderRadius: '12px' 
        }}>
          <p style={{ fontSize: '12px', color: TEXT3 }}>Aucune commande trouvée.</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: SURFACE2, borderBottom: `1px solid ${BORDER}` }}>
                <tr>
                  {['N° commande', 'Date', 'Client', 'Email', 'Articles', 'Total', 'Moyen', 'Règlement', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedOrders.map(o => (
                  <tr key={o.orderNumber} style={{ transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = SURFACE2)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={tdStyle}><span style={{ color: GOLD, fontWeight: 600 }}>{o.orderNumber}</span></td>
                    <td style={tdStyle}>{formatOrderDate(o.date)}</td>
                    <td style={tdStyle}>{o.delivery.firstName} {o.delivery.lastName}</td>
                    <td style={{ ...tdStyle, color: INFO_C }}>{o.delivery.email}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{formatPrice(o.total)}</td>
                    <td style={tdStyle}>{PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}</td>
                    <td style={tdStyle}>
                      {(() => {
                        const ps = o.paymentStatus ?? 'pending';
                        const meta = PAYMENT_STATUS_LABELS[ps] ?? PAYMENT_STATUS_LABELS.pending;
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '3px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: 700,
                              background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30`,
                              whiteSpace: 'nowrap',
                            }}>{meta.label}</span>
                            {ps !== 'paid' && (
                              <button
                                type="button"
                                onClick={() => markPaid(o.orderNumber)}
                                title="Confirmer l'encaissement de cette commande"
                                style={{
                                  background: 'none', border: `1px solid ${BORDER2}`, borderRadius: '6px',
                                  color: TEXT3, fontSize: '10px', padding: '2px 6px', cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Encaisser
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td style={tdStyle}>
                      <select
                        aria-label={`Statut de la commande ${o.orderNumber ?? ''}`}
                        value={o.status}
                        onChange={e => changeStatus(o.orderNumber, e.target.value as OrderStatus)}
                        style={{ 
                          background: BG, 
                          border: `1px solid ${BORDER2}`, 
                          borderRadius: '6px', 
                          color: STATUS_OPTIONS.find(s => s.value === o.status)?.color ?? TEXT, 
                          padding: '3px 6px', 
                          fontSize: '11px', 
                          fontWeight: 600, 
                          cursor: 'pointer' 
                        }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => openDetail(o)}
                        className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80"
                        style={{ borderColor: GOLD, color: GOLD, whiteSpace: 'nowrap' }}>
                        Détail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orderPageCount > 1 && <Pagination page={orderPage} total={orderPageCount} goToPage={setOrderPage} />}
        </>
      )}
    </div>
  );
}
