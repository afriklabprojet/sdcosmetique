'use client';

import { useState } from 'react';
import type { CartLine, CustomerSelection, DiscountInput } from '@/features/pos/pos.type';
import { cartSubtotal, discountAmount, cartTotal } from '@/features/pos/pos.util';
import { formatPrice } from '@/shared/format/price';
import CustomerPicker from '@/features/pos/terminal/customer-picker';
import { SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3 } from '@/features/admin/admin.constant';

type Props = {
  lines: CartLine[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  customer: CustomerSelection;
  onCustomerChange: (value: CustomerSelection) => void;
  discount: DiscountInput | null;
  onDiscountChange: (value: DiscountInput | null) => void;
  maxDiscountPercent: number | null;
  onCheckout: () => void;
};

export default function CartPanel({
  lines, onUpdateQuantity, onRemove, customer, onCustomerChange,
  discount, onDiscountChange, maxDiscountPercent, onCheckout,
}: Readonly<Props>) {
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('percent');

  const subtotal = cartSubtotal(lines);
  const discountAmt = discountAmount(subtotal, discount);
  const total = cartTotal(lines, discount);

  const applyDiscount = () => {
    const value = Number(discountValue);
    if (!value || value <= 0) {
      onDiscountChange(null);
      return;
    }
    onDiscountChange({ type: discountType, value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: SURFACE, borderLeft: `1px solid ${BORDER}` }}>
      <CustomerPicker value={customer} onChange={onCustomerChange} />

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {lines.length === 0 && <p style={{ color: TEXT2, fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>Panier vide — recherchez un produit.</p>}
        {lines.map((line) => (
          <div key={line.product.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: SURFACE2, borderRadius: '10px', padding: '10px 12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: TEXT, margin: 0, lineHeight: 1.3 }}>{line.product.title}</p>
              {line.product.label && <p style={{ fontSize: '10.5px', color: TEXT3, margin: '1px 0 0' }}>{line.product.label}</p>}
              <p style={{ fontSize: '11px', color: TEXT3, margin: '2px 0 0' }}>{formatPrice(line.product.unit_price)} / unité</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button type="button" onClick={() => onUpdateQuantity(line.product.id, line.quantity - 1)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${BORDER2}`, background: 'none', color: TEXT, fontSize: '18px', cursor: 'pointer' }}>−</button>
              <span style={{ minWidth: '24px', textAlign: 'center', color: TEXT, fontWeight: 700 }}>{line.quantity}</span>
              <button type="button" onClick={() => onUpdateQuantity(line.product.id, line.quantity + 1)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${BORDER2}`, background: 'none', color: TEXT, fontSize: '18px', cursor: 'pointer' }}>+</button>
            </div>
            <span style={{ minWidth: '76px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: TEXT }}>{formatPrice(line.product.unit_price * line.quantity)}</span>
            <button type="button" onClick={() => onRemove(line.product.id)} style={{ background: 'none', border: 'none', color: '#E07A7A', cursor: 'pointer', fontSize: '14px' }}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          <select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percent')}
            style={{ background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '6px', color: TEXT, fontSize: '12px', padding: '8px' }}>
            <option value="percent">%</option>
            <option value="fixed">FCFA</option>
          </select>
          <input
            type="number" min={0} placeholder={maxDiscountPercent !== null ? `Remise (max ${maxDiscountPercent}%)` : 'Remise'}
            value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
            style={{ flex: 1, background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '6px', color: TEXT, padding: '8px 10px', fontSize: '13px' }}
          />
          <button type="button" onClick={applyDiscount} style={{ background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '6px', color: GOLD, fontSize: '12px', fontWeight: 700, padding: '0 12px', cursor: 'pointer' }}>
            OK
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: TEXT2, marginBottom: '4px' }}>
          <span>Sous-total</span><span>{formatPrice(subtotal)}</span>
        </div>
        {discountAmt > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#7AC57A', marginBottom: '4px' }}>
            <span>Remise</span><span>−{formatPrice(discountAmt)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800, color: TEXT, marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${BORDER}` }}>
          <span>TOTAL</span><span>{formatPrice(total)}</span>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          disabled={lines.length === 0}
          style={{
            width: '100%', marginTop: '14px', padding: '18px', background: GOLD, color: '#1A0E05',
            border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 800, letterSpacing: '0.02em',
            cursor: lines.length === 0 ? 'not-allowed' : 'pointer', opacity: lines.length === 0 ? 0.4 : 1,
          }}
        >
          ENCAISSER
        </button>
      </div>
    </div>
  );
}
