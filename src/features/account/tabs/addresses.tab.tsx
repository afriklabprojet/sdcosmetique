'use client';

/* Carnet d'adresses du client. Extrait de `app/compte/page.tsx` (F-111). */

import type { Address } from '@/features/account/account.constant';

interface AddressesTabProps {
  readonly mobile: boolean;
  readonly addresses: Address[];
  readonly addrForm: Address;
  readonly setAddrForm: React.Dispatch<React.SetStateAction<Address>>;
  readonly showAddrForm: boolean;
  readonly setShowAddrForm: (v: boolean) => void;
  readonly editingAddr: string | null;
  readonly setEditingAddr: (v: string | null) => void;
  readonly saveAddress: () => void;
  readonly preferAddress: (id: string) => void;
  readonly deleteAddress: (id: string) => void;
}

export default function AddressesTab({
  mobile, addresses, addrForm, setAddrForm, showAddrForm, setShowAddrForm,
  editingAddr, setEditingAddr, saveAddress, preferAddress, deleteAddress,
}: AddressesTabProps) {
  return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>Mes adresses</h2>
                  <button
                    onClick={() => { setEditingAddr(null); setAddrForm({ id: '', label: 'Domicile', firstName: '', lastName: '', street: '', city: '', postalCode: '', country: 'Côte d\'Ivoire', phone: '', preferred: false }); setShowAddrForm(true); }}
                    style={{ padding: '9px 20px', background: '#3D1400', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >+ Ajouter une adresse</button>
                </div>

                {addresses.length === 0 && !showAddrForm && (
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '48px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 36, marginBottom: 12 }}>📍</p>
                    <p style={{ fontSize: 14, color: '#9A8A7A', marginBottom: 16 }}>Vous n&apos;avez pas encore enregistré d&apos;adresse.</p>
                    <button onClick={() => setShowAddrForm(true)} style={{ padding: '10px 24px', background: '#3D1400', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Ajouter une adresse</button>
                  </div>
                )}

                {addresses.map(addr => (
                  <div key={addr.id} style={{ background: '#fff', borderRadius: 16, border: addr.preferred ? '2px solid #C8974A' : '1px solid #EDE8E0', padding: '20px 24px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#1A1A1A' }}>{addr.label}</span>
                          {addr.preferred && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 99, background: '#FFF3E0', color: '#92400E' }}>Par défaut</span>}
                        </div>
                        <p style={{ fontSize: 13, color: '#4A3828', lineHeight: 1.7 }}>
                          {addr.firstName} {addr.lastName}<br />{addr.street}<br />{addr.postalCode} {addr.city}<br />{addr.country}{addr.phone ? <><br />{addr.phone}</> : ''}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {!addr.preferred && (
                          <button onClick={() => preferAddress(addr.id)} style={{ padding: '6px 12px', background: '#FAF8F5', border: '1px solid #EDE8E0', borderRadius: 8, fontSize: 11, color: '#6B3D14', cursor: 'pointer', fontWeight: 600 }}>Par défaut</button>
                        )}
                        <button onClick={() => { setAddrForm({ ...addr }); setEditingAddr(addr.id); setShowAddrForm(true); }} style={{ padding: '6px 12px', background: '#FAF8F5', border: '1px solid #EDE8E0', borderRadius: 8, fontSize: 11, color: '#6B3D14', cursor: 'pointer', fontWeight: 600 }}>Modifier</button>
                        <button onClick={() => deleteAddress(addr.id)} style={{ padding: '6px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 11, color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}>Supprimer</button>
                      </div>
                    </div>
                  </div>
                ))}

                {showAddrForm && (
                  <div style={{ background: '#fff', borderRadius: 16, border: '2px solid #C8974A', padding: '24px 28px' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginBottom: 20 }}>{editingAddr ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                      <div style={{ gridColumn: '1/-1' }}>
                        <label htmlFor="addr-label" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Libellé (ex: Domicile, Bureau…)</label>
                        <select id="addr-label" value={addrForm.label} onChange={e => setAddrForm(f => ({ ...f, label: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, background: '#FAFAF8', boxSizing: 'border-box' }}>
                          {['Domicile', 'Bureau', 'Autre'].map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      {[{ label: 'Prénom', key: 'firstName' }, { label: 'Nom', key: 'lastName' }, { label: 'Adresse', key: 'street', full: true }, { label: 'Ville', key: 'city' }, { label: 'Code postal', key: 'postalCode' }, { label: 'Téléphone', key: 'phone' }].map(f => (
                        <div key={f.key} style={f.full ? { gridColumn: '1/-1' } : {}}>
                          <label htmlFor={`addr-${f.key}`} style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                          <input
                            id={`addr-${f.key}`}
                            type="text"
                            value={addrForm[f.key as keyof typeof addrForm] as string}
                            onChange={e => setAddrForm(a => ({ ...a, [f.key]: e.target.value }))}
                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                      ))}
                      <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="checkbox" id="addrDefault" checked={addrForm.preferred} onChange={e => setAddrForm(f => ({ ...f, preferred: e.target.checked }))} />
                        <label htmlFor="addrDefault" style={{ fontSize: 13, color: '#4A3828', cursor: 'pointer' }}>Définir comme adresse par défaut</label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                      <button
                        onClick={saveAddress}
                        style={{ padding: '11px 28px', background: '#3D1400', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      >{editingAddr ? 'Enregistrer' : 'Ajouter'}</button>
                      <button onClick={() => { setShowAddrForm(false); setEditingAddr(null); }} style={{ padding: '11px 20px', background: 'none', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, color: '#6B3D14', cursor: 'pointer' }}>Annuler</button>
                    </div>
                  </div>
                )}
              </div>
  );
}
