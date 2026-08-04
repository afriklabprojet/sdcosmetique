'use client';

/* Onglet «clients» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import Pagination from '@/features/admin/pagination';
import { type ClientRow } from '@/features/admin/admin.type';
import { formatPrice } from '@/features/catalog/product.query';
import { SURFACE2, GOLD, TEXT, TEXT3, INFO_C, thStyle, tdStyle, card, inputStyle } from '@/features/admin/admin.constant';

interface ClientsTabProps {
  readonly clientList: ClientRow[];
  readonly filteredClients: ClientRow[];
  readonly pagedClients: ClientRow[];
  readonly clientPage: number;
  readonly clientPageCount: number;
  readonly clientSearch: string;
  readonly setClientPage: (n: number) => void;
  readonly setClientSearch: (s: string) => void;
}

export default function ClientsTab({ clientList, filteredClients, pagedClients, clientPage, clientPageCount, clientSearch, setClientPage, setClientSearch }: ClientsTabProps) {
  return (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-lg font-bold" style={{ color: TEXT }}>Clients ({filteredClients.length})</h1>
                <label htmlFor="search-clients" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: TEXT3, fontWeight: 600 }}>Recherche :</span>
                  <input id="search-clients" type="search" placeholder="Rechercher nom, email…"
                    value={clientSearch}
                    onChange={e => { setClientSearch(e.target.value); setClientPage(1); }}
                    style={{ ...inputStyle, width: '220px' }}
                  />
                </label>
              </div>
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {filteredClients.length === 0 ? (
                  <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>
                    {clientList.length === 0 ? 'Aucun client pour le moment.' : 'Aucun résultat.'}
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ background: SURFACE2 }}>
                          <tr>{['Client', 'Email', 'Commandes', 'CA total', 'Dernière commande'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {pagedClients.map(c => (
                            <tr key={c.email} style={{ transition: 'background .15s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = SURFACE2)}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                              <td style={{ ...tdStyle, fontWeight: 600 }}>{c.name}</td>
                              <td style={{ ...tdStyle, color: INFO_C }}>{c.email}</td>
                              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: TEXT }}>{c.orders}</td>
                              <td style={{ ...tdStyle, fontWeight: 600, color: GOLD }}>{formatPrice(c.total)}</td>
                              <td style={{ ...tdStyle, color: TEXT3 }}>{new Date(c.lastDate).toLocaleDateString('fr-FR')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {clientPageCount > 1 && <Pagination page={clientPage} total={clientPageCount} onChange={setClientPage} />}
                  </>
                )}
              </div>
            </div>
  );
}
