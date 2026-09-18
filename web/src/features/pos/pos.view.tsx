'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Session, Pos } from '@/shared/api/admin';
import type { PosSession, PosProduct, PosSale, PosDailyReport, JekoNetwork } from '@/shared/api/admin/pos';
import { ApiError, apiErrorMessage, apiRoot, resetCsrf } from '@/shared/api/client';
import { toast } from '@/shared/ui/toast';
import { formatPrice } from '@/shared/format/price';
import type { CartLine, CustomerSelection, DiscountInput, TenderLine } from '@/features/pos/pos.type';
import { generateIdempotencyKey, cartTotal } from '@/features/pos/pos.util';
import { enqueueSale } from '@/features/pos/offline/pos-offline-db';
import { useOfflineSync } from '@/features/pos/offline/use-offline-sync';
import OpenSessionScreen from '@/features/pos/terminal/open-session.screen';
import ProductSearch from '@/features/pos/terminal/product-search';
import CartPanel from '@/features/pos/terminal/cart-panel';
import PaymentModal from '@/features/pos/terminal/payment-modal';
import ReceiptScreen from '@/features/pos/terminal/receipt-screen';
import JekoWaitingScreen from '@/features/pos/terminal/jeko-waiting.screen';
import OfflineConfirmationScreen from '@/features/pos/terminal/offline-confirmation.screen';
import CloseSessionModal from '@/features/pos/terminal/close-session.modal';
import { BG, SURFACE, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3 } from '@/features/admin/admin.constant';

const DISCOUNT_LIMITS: Record<string, number | null> = { cashier: 10, manager: 30 };
const EMPTY_CUSTOMER: CustomerSelection = { mode: 'walkin', name: '', phone: '', email: '' };

export default function PosView() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<string>('super_admin');
  const [operatorId, setOperatorId] = useState<number | null>(null);
  const [operatorName, setOperatorName] = useState('');
  const [switchAfterClose, setSwitchAfterClose] = useState(false);

  const [session, setSession] = useState<PosSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [lines, setLines] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState<CustomerSelection>(EMPTY_CUSTOMER);
  const [discount, setDiscount] = useState<DiscountInput | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(generateIdempotencyKey());

  const [showPayment, setShowPayment] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [saleBusy, setSaleBusy] = useState(false);
  const [completedSale, setCompletedSale] = useState<PosSale | null>(null);
  const [pendingJekoSale, setPendingJekoSale] = useState<PosSale | null>(null);
  const [offlineSaleTotal, setOfflineSaleTotal] = useState<number | null>(null);

  const [report, setReport] = useState<PosDailyReport | null>(null);
  const { queuedCount, syncNow } = useOfflineSync(operatorId);

  const refreshSession = useCallback(() => {
    setLoadingSession(true);
    Pos.currentSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoadingSession(false));
  }, []);

  useEffect(() => {
    Session.fetch()
      .then((s) => {
        setRole(s.admin.role);
        setOperatorId(s.user.id);
        setOperatorName(s.user.name);
      })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setChecking(false));
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- charge la session caisse une fois l'authentification confirmée
    if (!checking) refreshSession();
  }, [checking, refreshSession]);

  useEffect(() => {
    if (session) Pos.dailyReport().then(setReport).catch(() => undefined);
  }, [session]);

  // Portée volontairement restreinte à /admin/pos (voir public/pos-sw.js) — n'affecte jamais le reste du site.
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/pos-sw.js', { scope: '/admin/pos' }).catch(() => undefined);
    }
  }, []);

  const addProduct = useCallback((product: PosProduct) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setLines((prev) => {
      if (quantity < 1) return prev.filter((l) => l.product.id !== productId);
      return prev.map((l) => (l.product.id === productId ? { ...l, quantity } : l));
    });
  }, []);

  const removeLine = useCallback((productId: number) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }, []);

  const resetForNewSale = useCallback(() => {
    setLines([]);
    setDiscount(null);
    setCustomer(EMPTY_CUSTOMER);
    setIdempotencyKey(generateIdempotencyKey());
    setCompletedSale(null);
    setPendingJekoSale(null);
    setOfflineSaleTotal(null);
    Pos.dailyReport().then(setReport).catch(() => undefined);
  }, []);

  const logoutCashier = async () => {
    await apiRoot('/logout', { method: 'POST' }).catch(() => undefined);
    resetCsrf();
    router.replace('/admin/login?next=/admin/pos');
  };

  const switchCashier = () => {
    if (session) {
      setSwitchAfterClose(true);
      setShowClose(true);
      return;
    }

    void logoutCashier();
  };

  const confirmPayment = async (tenders: TenderLine[], jekoNetwork?: JekoNetwork) => {
    if (!session || operatorId === null) return;
    setSaleBusy(true);

    const payload = {
      cash_register_session_id: session.id,
      client_id: customer.mode === 'client' ? customer.clientId : null,
      email: customer.mode === 'walkin' ? (customer.email.trim() || null) : null,
      customer_name: customer.mode === 'walkin' ? (customer.name || null) : null,
      customer_phone: customer.mode === 'walkin' ? (customer.phone || null) : null,
      items: lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
      discount: discount ?? undefined,
      tenders,
      payment_method: jekoNetwork,
      idempotency_key: idempotencyKey,
    };

    try {
      const sale = await Pos.createSale(payload);
      setShowPayment(false);
      if (sale.tenders.some((t) => t.pending)) {
        setPendingJekoSale(sale);
      } else {
        setCompletedSale(sale);
      }
    } catch (err) {
      if (!(err instanceof ApiError)) {
        // Pas de réponse serveur du tout : coupure réseau — on file d'attente
        // plutôt que de faire perdre la vente au vendeur (§30).
        await enqueueSale(payload, operatorId);
        setShowPayment(false);
        setOfflineSaleTotal(cartTotal(lines, discount));
        toast.error('Pas de connexion — vente mise en attente de synchronisation.');
      } else {
        toast.error(apiErrorMessage(err, 'Impossible de finaliser la vente.'));
      }
    } finally {
      setSaleBusy(false);
    }
  };

  if (checking || loadingSession) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT2 }}>
        Chargement…
      </div>
    );
  }

  if (!session) {
    return <OpenSessionScreen operatorName={operatorName} onOpened={refreshSession} onSwitchCashier={switchCashier} />;
  }

  const total = cartTotal(lines, discount);
  const maxDiscountPercent = DISCOUNT_LIMITS[role] ?? null;

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, background: SURFACE, flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: GOLD }}>CAISSE</span>
          {report && (
            <>
              <Stat label="CA du jour" value={formatPrice(report.revenue)} />
              <Stat label="Ventes" value={String(report.sales_count)} />
              <Stat label="Panier moyen" value={formatPrice(report.average_ticket)} />
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '7px 10px', borderLeft: `1px solid ${BORDER}`, color: TEXT2, fontSize: '12px' }}>
            <span style={{ display: 'block', color: TEXT3, fontSize: '9px', textTransform: 'uppercase' }}>Caissière connectée</span>
            <strong style={{ color: TEXT }}>{operatorName}</strong>
          </div>
          {queuedCount > 0 && (
            <button
              type="button"
              onClick={() => void syncNow()}
              title="Ventes en attente de synchronisation"
              style={{ padding: '10px 14px', border: 'none', borderRadius: '8px', background: '#4A3A1A', color: '#FCD34D', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              ⏳ {queuedCount} en attente — Synchroniser
            </button>
          )}
          <Link href="/admin/pos/history" style={{ padding: '10px 16px', border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT, fontSize: '13px', textDecoration: 'none' }}>
            Historique
          </Link>
          <button type="button" onClick={switchCashier} style={{ padding: '10px 16px', border: `1px solid ${BORDER2}`, borderRadius: '8px', background: 'none', color: TEXT2, fontSize: '13px', cursor: 'pointer' }}>
            Changer de caissière
          </button>
          {role !== 'cashier' && (
            <Link href="/admin" style={{ padding: '10px 16px', border: `1px solid ${BORDER2}`, borderRadius: '8px', color: TEXT2, fontSize: '13px', textDecoration: 'none' }}>
              ← Dashboard
            </Link>
          )}
          <button type="button" onClick={() => { setSwitchAfterClose(false); setShowClose(true); }} style={{ padding: '10px 16px', border: 'none', borderRadius: '8px', background: '#4A1D1D', color: '#FCA5A5', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
            Fermer la caisse
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', minHeight: 0 }}>
        <ProductSearch onAdd={addProduct} />
        <CartPanel
          lines={lines}
          onUpdateQuantity={updateQuantity}
          onRemove={removeLine}
          customer={customer}
          onCustomerChange={setCustomer}
          discount={discount}
          onDiscountChange={setDiscount}
          maxDiscountPercent={maxDiscountPercent}
          onCheckout={() => setShowPayment(true)}
        />
      </div>

      {showPayment && (
        <PaymentModal total={total} busy={saleBusy} onConfirm={confirmPayment} onCancel={() => setShowPayment(false)} />
      )}

      {pendingJekoSale && (
        <JekoWaitingScreen
          sale={pendingJekoSale}
          onPaid={(sale) => { setPendingJekoSale(null); setCompletedSale(sale); }}
          onCancelled={resetForNewSale}
        />
      )}
      {completedSale && <ReceiptScreen sale={completedSale} onNewSale={resetForNewSale} />}
      {offlineSaleTotal !== null && <OfflineConfirmationScreen total={offlineSaleTotal} onNewSale={resetForNewSale} />}

      {showClose && (
        <CloseSessionModal
          session={session}
          onCancel={() => { setShowClose(false); setSwitchAfterClose(false); }}
          onClosed={() => {
            setShowClose(false);
            if (switchAfterClose) void logoutCashier();
            else refreshSession();
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
      <span style={{ fontSize: '9px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 700, color: TEXT }}>{value}</span>
    </div>
  );
}
