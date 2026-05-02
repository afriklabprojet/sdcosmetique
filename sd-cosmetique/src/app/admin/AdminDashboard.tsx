'use client';

import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { formatOrderDate, updateOrderStatus, OrderDraft } from '@/lib/orders';
import { formatPrice, PRODUCTS } from '@/lib/products';
import { Product, Category, SkinTone, Review } from '@/types';
import { fetchAllOrdersFromDB, updateOrderStatusInDB, updateProductInDB, fetchProductsFromDB, addProductToDB, deleteProductFromDB, fetchAllReviewsFromDB, deleteReviewFromDB, approveReviewInDB } from '@/lib/orders-db';
import { DEFAULT_SITE_CONFIG } from '@/lib/site-config';
import type { SiteConfig, PromoCode, ShippingOption, MarketingConfig, PromoBanner, WelcomePopup, UpsellRule } from '@/lib/site-config';
import { saveSiteConfigSection } from './actions';
import ImageUpload from '@/components/ui/ImageUpload';
import { fetchAllTestimonialsAdmin, approveTestimonialInDB, deleteTestimonialFromDB } from '@/lib/testimonials-db';
import type { TestimonialRow } from '@/lib/testimonials-db';
import { fetchAllCategoriesAdmin, addCategoryToDB, updateCategoryInDB, deleteCategoryFromDB } from '@/lib/categories-db';
import type { CategoryRow } from '@/lib/categories-db';
import { fetchAllConcernsAdmin, fetchAllRoutinesAdmin, upsertConcern, upsertRoutine, deleteConcern, deleteRoutine } from '@/lib/quiz-db';
import type { QuizConcern, QuizRoutine } from '@/lib/quiz-db';
import {
  getJekoSettings, getJekoTiersConfig, getJekoRewardsConfig, saveJekoConfig,
  getJekoMembers, getAllJekoTransactions, manualJekoAdjustment, getJekoStats,
} from '@/lib/jeko-admin';
import type { JekoSettings, JekoTierConfig, JekoRewardConfig, JekoMember, JekoTransactionAdmin, JekoStats } from '@/lib/jeko-admin';

function NewsletterCard() {
  const [count, setCount] = useState<number | null>(null);
  const [latest, setLatest] = useState<Array<{ email: string; created_at: string }>>([]);
  useEffect(() => {
    fetch('/api/newsletter/list')
      .then(r => r.ok ? r.json() : { subscribers: [] })
      .then(d => {
        const subs = d.subscribers ?? [];
        setCount(subs.length);
        setLatest(subs.slice(0, 5));
      })
      .catch(() => { setCount(0); setLatest([]); });
  }, []);
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '32px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.02em' }}>{count ?? '…'}</span>
        <span style={{ fontSize: '11px', color: '#888' }}>abonné{(count ?? 0) > 1 ? 's' : ''}</span>
      </div>
      <a href="/api/newsletter/list?format=csv" download
        style={{ alignSelf: 'flex-start', fontSize: '11px', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(212,162,78,0.4)', background: 'rgba(212,162,78,0.08)', color: '#D4A24E', cursor: 'pointer', textDecoration: 'none' }}>
        ⬇ Exporter CSV
      </a>
      {latest.length > 0 && (
        <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '8px', marginTop: '4px' }}>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Derniers inscrits</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {latest.map((s, i) => (
              <li key={i} style={{ fontSize: '11px', color: '#BBB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function QuizAnalyticsCard() {
  const [items, setItems] = useState<Array<{ skin_tone: string | null; concern: string | null; routine: string | null; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/quiz/submit')
      .then(r => r.ok ? r.json() : { items: [] })
      .then(d => setItems(d.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const total = items.length;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const last30 = items.filter(i => Date.now() - new Date(i.created_at).getTime() < 30 * 86400000).length;
  const tally = (key: 'skin_tone' | 'concern' | 'routine') => {
    const m = new Map<string, number>();
    for (const it of items) {
      const v = it[key];
      if (!v) continue;
      m.set(v, (m.get(v) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const concerns = tally('concern');
  const tones = tally('skin_tone');
  const routines = tally('routine');
  const maxConcern = concerns[0]?.[1] ?? 1;

  const Row = ({ label, count, max }: { label: string; count: number; max: number }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
      <span style={{ flex: '0 0 130px', color: '#BBB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: '6px', background: '#1C1610', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${(count / max) * 100}%`, height: '100%', background: '#C8974A' }} />
      </div>
      <span style={{ flex: '0 0 30px', textAlign: 'right', color: '#E8DDD0', fontWeight: 600 }}>{count}</span>
    </div>
  );

  return (
    <div style={{ background: '#14100C', border: '1px solid #2E2218', borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#C8974A' }}>Analytics quiz</h2>
        <span style={{ fontSize: '10px', color: '#888' }}>{loading ? '…' : `${total} soumissions · ${last30} sur 30j`}</span>
      </div>
      {loading ? (
        <p style={{ fontSize: '11px', color: '#888' }}>Chargement…</p>
      ) : total === 0 ? (
        <p style={{ fontSize: '11px', color: '#888' }}>Aucune soumission. La table <code>quiz_submissions</code> doit exister (migration <code>20260430012000</code>).</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h3 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Préoccupations</h3>
            {concerns.slice(0, 8).map(([k, v]) => <Row key={k} label={k} count={v} max={maxConcern} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h3 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Carnations</h3>
            {tones.slice(0, 8).map(([k, v]) => <Row key={k} label={k} count={v} max={tones[0]?.[1] ?? 1} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h3 style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Routines</h3>
            {routines.slice(0, 8).map(([k, v]) => <Row key={k} label={k} count={v} max={routines[0]?.[1] ?? 1} />)}
          </div>
        </div>
      )}
    </div>
  );
}


type OrderStatus = OrderDraft['status'];
type ReviewRow = Review & { productId?: string };
type ProductModalState = Partial<Product> & { _isNew?: boolean };
type Tab = 'dashboard' | 'commandes' | 'produits' | 'avis' | 'temoignages' | 'categories' | 'quiz' | 'clients' | 'contenu' | 'jeko' | 'newsletter' | 'livraison' | 'marketing';
type NewsletterSub = { id: string; email: string; source: string | null; unsubscribed: boolean; created_at: string };

// ── Palette (module-level so STATUS_OPTIONS can reference them) ───────────────
const BG       = '#0D0906';
const SURFACE  = '#14100C';
const SURFACE2 = '#1C1610';
const BORDER   = '#2E2218';
const BORDER2  = '#3D2E1A';
const GOLD     = '#C8974A';
const TEXT     = '#E8DDD0';
const TEXT2    = '#A8957E';
const TEXT3    = '#6B5840';
const TITLE    = '#F7EFE5';
const TEXT_M   = '#9A8A7A';
const GOLD2    = '#D4A25A';
const INFO_C   = '#7A9A7A';
const BTN_BG   = '#2A1A0A';
const BORDER3  = '#3A2A1A';
const S_ERR_BG  = '#4A1D1D';
const S_ERR_T   = '#FCA5A5';
const S_OK_BG   = '#064E3B';
const S_OK_T    = '#6EE7B7';
const S_WARN_BG = '#4A3A1A';
const S_WARN_T  = '#FCD34D';
const S_INFO_BG = '#1E3A5F';
const S_INFO_T  = '#93C5FD';
const S_SAVE_BG = '#2A4A2A';
const S_SAVE_T  = '#5ACA5A';
const GOLD_D  = '#7B4A1A';
const GOLD_D2 = '#6B3D14';
const GOLD_D3 = '#5A2B0C';
const ACCENT_P = '#C4B5FD';
const ACCENT_Y = '#FDE68A';

const STATUS_OPTIONS: { value: OrderStatus; label: string; bg: string; color: string }[] = [
  { value: 'confirmed',  label: 'Confirmée',   bg: S_OK_BG,   color: S_OK_T   },
  { value: 'processing', label: 'En cours',     bg: S_INFO_BG, color: S_INFO_T },
  { value: 'shipped',    label: 'Expédiée',     bg: S_WARN_BG, color: S_WARN_T },
  { value: 'delivered',  label: 'Livrée',       bg: S_OK_BG,   color: S_OK_T   },
];

const PAYMENT_LABELS: Record<string, string> = {
  orange_money: 'Orange Money',
  wave: 'Wave',
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  visa: 'Visa',
  mastercard: 'Mastercard',
};

const PER_PAGE = 10;

// ─── CSV export ───────────────────────────────────────────────────────────────
function exportOrdersCSV(orders: OrderDraft[]) {
  const header = ['N° commande', 'Date', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Adresse', 'Ville', 'Pays', 'Articles', 'Sous-total', 'Livraison', 'Total', 'Paiement', 'Statut'];
  const rows = orders.map(o => [
    o.orderNumber,
    formatOrderDate(o.date),
    o.delivery.firstName,
    o.delivery.lastName,
    o.delivery.email,
    o.delivery.phone,
    o.delivery.address,
    o.delivery.city,
    o.delivery.country,
    o.items.reduce((s, i) => s + i.quantity, 0),
    o.subtotal,
    o.shippingCost,
    o.total,
    PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod,
    STATUS_OPTIONS.find(s => s.value === o.status)?.label ?? o.status,
  ]);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `commandes-sd-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Composants utilitaires (module-level) ──────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_OPTIONS.find(x => x.value === status) ?? STATUS_OPTIONS[0];
  return <span style={{ background: s.bg, color: s.color, borderRadius: '99px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' as const, border: `1px solid ${s.bg}` }}>{s.label}</span>;
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${BORDER}` }}>
      <span className="text-xs" style={{ color: TEXT3 }}>Page {page} / {total}</span>
      <div className="flex gap-2">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1}
          className="text-xs px-3 py-1 rounded border transition-all disabled:opacity-30"
          style={{ borderColor: BORDER2, color: TEXT2, background: SURFACE2 }}>← Préc.</button>
        <button onClick={() => onChange(page + 1)} disabled={page >= total}
          className="text-xs px-3 py-1 rounded border transition-all disabled:opacity-30"
          style={{ borderColor: BORDER2, color: TEXT2, background: SURFACE2 }}>Suiv. →</button>
      </div>
    </div>
  );
}

// ─── Inline editable product state ───────────────────────────────────────────
type EditableProduct = Product

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [orders, setOrders] = useState<OrderDraft[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('');

  // pagination
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);

  // inline product editing
  const [editableProducts, setEditableProducts] = useState<EditableProduct[]>([]);
  // product modal (null = closed)
  const [productModal, setProductModal] = useState<ProductModalState | null>(null);
  // delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  // reviews
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewPage, setReviewPage] = useState(1);
  const [clientSearch, setClientSearch] = useState('');
  const [clientPage, setClientPage] = useState(1);
  const [orderDetail, setOrderDetail] = useState<OrderDraft | null>(null);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [testiSearch, setTestiSearch] = useState('');
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [catModal, setCatModal] = useState<Partial<CategoryRow> & { _isNew?: boolean } | null>(null);
  const [catSaving, setCatSaving] = useState(false);
  const [quizConcerns, setQuizConcerns] = useState<QuizConcern[]>([]);
  const [quizRoutines, setQuizRoutines] = useState<QuizRoutine[]>([]);
  type QuizItemModal = { type: 'concern'; data: Partial<QuizConcern> & { _isNew?: boolean } } | { type: 'routine'; data: Partial<QuizRoutine> & { _isNew?: boolean } };
  const [quizModal, setQuizModal] = useState<QuizItemModal | null>(null);
  const [quizSaving, setQuizSaving] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [contentSaving, setContentSaving] = useState<Record<string, boolean>>({});
  const [contentSaved, setContentSaved] = useState<Record<string, boolean>>({});

  // ── Marketing tab ────────────────────────────────────────────────────────────
  const [mktSubTab, setMktSubTab] = useState<'banners' | 'popup' | 'promos' | 'upsell' | 'tracking'>('banners');

  // ── Jeko admin ───────────────────────────────────────────────────────────────
  const [jekoSubTab, setJekoSubTab] = useState<'config' | 'membres' | 'transactions'>('config');
  const [, setJekoSettings] = useState<JekoSettings>({ points_per_1000: 10, welcome_bonus: 20 });
  const [jekoSettingsEdit, setJekoSettingsEdit] = useState<JekoSettings>({ points_per_1000: 10, welcome_bonus: 20 });
  const [jekoTiersConf, setJekoTiersConf] = useState<JekoTierConfig[]>([]);
  const [jekoRewardsConf, setJekoRewardsConf] = useState<JekoRewardConfig[]>([]);
  const [jekoMembers, setJekoMembers] = useState<JekoMember[]>([]);
  const [jekoTxns, setJekoTxns] = useState<JekoTransactionAdmin[]>([]);
  const [jekoStats, setJekoStats] = useState<JekoStats>({ totalMembers: 0, totalPointsDistributed: 0, totalRedemptions: 0 });
  const [jekoMemberSearch, setJekoMemberSearch] = useState('');
  const [jekoAdjModal, setJekoAdjModal] = useState<{ member: JekoMember; pts: string; label: string; notify: boolean } | null>(null);
  const [jekoAdjSaving, setJekoAdjSaving] = useState(false);
  const [jekoAdjMsg, setJekoAdjMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [jekoConfSaving, setJekoConfSaving] = useState(false);
  const [jekoConfMsg, setJekoConfMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [jekoRewardEdit, setJekoRewardEdit] = useState<JekoRewardConfig | null>(null);
  const [jekoTierEdit, setJekoTierEdit] = useState<JekoTierConfig | null>(null);
  const [jekoMemberTxns, setJekoMemberTxns] = useState<{ [uid: string]: JekoTransactionAdmin[] }>({});
  const [newsletterSubs, setNewsletterSubs] = useState<NewsletterSub[]>([]);
  const [newsletterSearch, setNewsletterSearch] = useState('');
  const [newsletterFilter, setNewsletterFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');

  const reloadNewsletter = () => {
    fetch('/api/newsletter/list')
      .then(r => r.ok ? r.json() : { subscribers: [] })
      .then(d => setNewsletterSubs(d.subscribers ?? []))
      .catch(() => setNewsletterSubs([]));
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/admin/login');
      } else {
        setAuthChecked(true);
        setUserEmail(data.user.email ?? '');
        fetchAllOrdersFromDB().then(setOrders);
        fetchProductsFromDB().then(rows =>
          setEditableProducts((rows ?? []).length > 0
            ? (rows as Product[]).map(p => ({ ...p }))
            : PRODUCTS.map(p => ({ ...p }))
          )
        );
        fetchAllReviewsFromDB().then(data => setReviews(data as ReviewRow[]));
        fetchAllTestimonialsAdmin().then(setTestimonials);
        fetchAllCategoriesAdmin().then(setCategories);
        fetchAllConcernsAdmin().then(setQuizConcerns);
        fetchAllRoutinesAdmin().then(setQuizRoutines);
        // Newsletter
        reloadNewsletter();
        // Jeko
        getJekoSettings().then(s => { setJekoSettings(s); setJekoSettingsEdit(s); });
        getJekoTiersConfig().then(setJekoTiersConf);
        getJekoRewardsConfig().then(setJekoRewardsConf);
        getJekoMembers().then(setJekoMembers);
        getAllJekoTransactions().then(setJekoTxns);
        getJekoStats().then(setJekoStats);
        // Charger le contenu du site depuis Supabase
        supabase.from('site_config').select('key, value').then(({ data: cfgRows }) => {
          if (cfgRows?.length) {
            const cfg = JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG)) as SiteConfig;
            for (const row of cfgRows) {
              if (row.key in cfg) (cfg as Record<string, unknown>)[row.key] = row.value;
            }
            setSiteContent(cfg);
          }
        });
      }
    });
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleStatusChange = (orderNumber: string, status: OrderStatus) => {
    updateOrderStatus(orderNumber, status);
    updateOrderStatusInDB(orderNumber, status);
    setOrders(prev => prev.map(o => o.orderNumber === orderNumber ? { ...o, status } : o));
    // Email d'expédition (fire & forget)
    if (status === 'shipped') {
      const order = orders.find(o => o.orderNumber === orderNumber);
      if (order) {
        fetch('/api/orders/notify-shipped', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: { ...order, status } }),
        }).catch(() => {});
      }
    }
  };

  // ── product modal helpers ──
  const openEditModal = (p: EditableProduct) => setProductModal({ ...p, _isNew: false });
  const openNewModal = () => setProductModal({
    _isNew: true, id: `p${Date.now()}`, name: '', slug: '', category: 'face' as Category,
    price: 0, images: [''], skinTones: [], benefits: [], rating: 0, reviewCount: 0,
    shortDescription: '', description: '', usage: '', inStock: true, stockQty: 0, lowStockThreshold: 5, isNew: false, isBestseller: false,
  });
  const saveModal = () => {
    if (!productModal?.name?.trim() || !productModal?.slug?.trim() || !productModal?.category) return;
    const validImages = (productModal.images ?? []).filter(u => u && u.trim());
    if (validImages.length === 0) return;
    const { _isNew, ...rest } = productModal;
    const p: Product = {
      id: rest.id ?? `p${Date.now()}`,
      name: rest.name!.trim(),
      slug: rest.slug!.trim(),
      category: rest.category!,
      price: rest.price ?? 0,
      originalPrice: rest.originalPrice,
      images: validImages,
      skinTones: rest.skinTones ?? [],
      badges: rest.badges ?? [],
      rating: rest.rating ?? 0,
      reviewCount: rest.reviewCount ?? 0,
      shortDescription: rest.shortDescription ?? '',
      description: rest.description ?? '',
      benefits: rest.benefits ?? [],
      usage: rest.usage ?? '',
      ingredients: rest.ingredients,
      inStock: rest.inStock ?? true,
      stockQty: rest.stockQty,
      lowStockThreshold: rest.lowStockThreshold,
      isNew: rest.isNew,
      isBestseller: rest.isBestseller,
    };
    if (_isNew) {
      addProductToDB(p);
      setEditableProducts(prev => [...prev, p]);
    } else {
      updateProductInDB(p.id, p);
      setEditableProducts(prev => prev.map(x => x.id === p.id ? p : x));
    }
    setProductModal(null);
  };
  const handleDeleteProduct = async (id: string) => {
    await deleteProductFromDB(id);
    setEditableProducts(prev => prev.filter(p => p.id !== id));
    setConfirmDelete(null);
  };
  const handleDeleteReview = async (id: string) => {
    await deleteReviewFromDB(id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };
  const handleToggleReview = async (id: string, current: boolean) => {
    await approveReviewInDB(id, !current);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, verified: !current } : r));
  };

  // ── filtered & paginated data ──
  const filteredOrders = useMemo(() => {
    const q = orderSearch.toLowerCase();
    return orders.filter(o =>
      (!q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.delivery.firstName.toLowerCase().includes(q) ||
        o.delivery.lastName.toLowerCase().includes(q) ||
        o.delivery.email.toLowerCase().includes(q)) &&
      (!orderStatusFilter || o.status === orderStatusFilter)
    );
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    return editableProducts.filter(p =>
      (!q || p.name.toLowerCase().includes(q)) &&
      (!productCatFilter || p.category === productCatFilter)
    );
  }, [editableProducts, productSearch, productCatFilter]);

  const filteredReviews = useMemo(() => {
    const q = reviewSearch.toLowerCase();
    return reviews.filter(r => !q || r.author.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q));
  }, [reviews, reviewSearch]);

  const clientList = useMemo(() => {
    const map = new Map<string, { email: string; name: string; orders: number; total: number; lastDate: string }>();
    orders.forEach(o => {
      const email = o.delivery.email;
      const existing = map.get(email);
      if (existing) {
        existing.orders++;
        existing.total += o.total;
        if (o.date > existing.lastDate) existing.lastDate = o.date;
      } else {
        map.set(email, { email, name: `${o.delivery.firstName} ${o.delivery.lastName}`, orders: 1, total: o.total, lastDate: o.date });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [orders]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase();
    return clientList.filter(c => !q || c.email.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }, [clientList, clientSearch]);

  const orderPageCount   = Math.max(1, Math.ceil(filteredOrders.length  / PER_PAGE));
  const productPageCount = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const reviewPageCount  = Math.max(1, Math.ceil(filteredReviews.length  / PER_PAGE));
  const clientPageCount  = Math.max(1, Math.ceil(filteredClients.length  / PER_PAGE));
  const pagedOrders   = filteredOrders.slice((orderPage   - 1) * PER_PAGE, orderPage   * PER_PAGE);
  const pagedProducts = filteredProducts.slice((productPage - 1) * PER_PAGE, productPage * PER_PAGE);
  const pagedReviews  = filteredReviews.slice((reviewPage  - 1) * PER_PAGE, reviewPage  * PER_PAGE);
  const pagedClients  = filteredClients.slice((clientPage  - 1) * PER_PAGE, clientPage  * PER_PAGE);

  const totalRevenue     = orders.reduce((sum, o) => sum + o.total, 0);
  const thisMonth        = new Date().toISOString().slice(0, 7);
  const revenueThisMonth = orders.filter(o => o.date.startsWith(thisMonth)).reduce((s, o) => s + o.total, 0);
  const ordersInProgress = orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length;
  const recentOrders     = orders.slice(0, 5);
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key   = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      const value = orders.filter(o => o.date.slice(0, 10) === key).reduce((s, o) => s + o.total, 0);
      days.push({ label, value });
    }
    return days;
  }, [orders]);
  const maxDay = Math.max(...last7Days.map(d => d.value), 1);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: GOLD, borderTopColor: 'transparent' }} />
          <span style={{ color: TEXT3, fontSize: '12px', letterSpacing: '0.1em' }}>CHARGEMENT…</span>
        </div>
      </div>
    );
  }

  /* ── shared style objects (palette constants are module-level) ── */
  const card: React.CSSProperties = { background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px' };
  const thStyle: React.CSSProperties = { padding: '10px 16px', textAlign: 'left' as const, fontSize: '11px', fontWeight: 600, color: TEXT3, textTransform: 'uppercase' as const, letterSpacing: '0.06em', borderBottom: `1px solid ${BORDER}` };
  const tdStyle: React.CSSProperties = { padding: '11px 16px', fontSize: '12px', color: TEXT, borderBottom: `1px solid ${SURFACE2}` };
  const inputStyle: React.CSSProperties = { background: BG, border: `1px solid ${BORDER2}`, borderRadius: '6px', color: TEXT, padding: '6px 12px', fontSize: '12px', outline: 'none', width: '100%' };

  // StatusBadge et Pagination définis au niveau module (avant AdminPage)

  // ── Jeko helpers (component-level) ──────────────────────────────────────────
  const jekoGetTierLabel = (pts: number) => {
    const sorted = [...jekoTiersConf].sort((a, b) => (b.min ?? 0) - (a.min ?? 0));
    return sorted.find(t => pts >= (t.min ?? 0)) ?? jekoTiersConf[0];
  };
  const jekoSaveSettings = async () => {
    setJekoConfSaving(true);
    const res = await saveJekoConfig('settings', jekoSettingsEdit);
    setJekoSettings({ ...jekoSettingsEdit });
    setJekoConfSaving(false);
    setJekoConfMsg({ ok: res.ok, text: res.ok ? 'Paramètres sauvegardés ✓' : res.error ?? 'Erreur' });
    setTimeout(() => setJekoConfMsg(null), 3000);
  };
  const jekoSaveReward = async (r: JekoRewardConfig) => {
    const updated = jekoRewardsConf.map(x => x.id === r.id ? r : x);
    const res = await saveJekoConfig('rewards', updated);
    if (res.ok) { setJekoRewardsConf(updated); setJekoRewardEdit(null); }
    else alert(res.error);
  };
  const jekoSaveTier = async (t: JekoTierConfig) => {
    const updated = jekoTiersConf.map(x => x.label === t.label ? t : x);
    const res = await saveJekoConfig('tiers', updated);
    if (res.ok) { setJekoTiersConf(updated); setJekoTierEdit(null); }
    else alert(res.error);
  };
  const handleJekoAdjust = async () => {
    if (!jekoAdjModal) return;
    const pts = parseInt(jekoAdjModal.pts);
    if (isNaN(pts) || pts === 0) { setJekoAdjMsg({ ok: false, text: 'Nombre de points invalide' }); return; }
    setJekoAdjSaving(true);
    const memberId = jekoAdjModal.member.id;
    const shouldNotify = jekoAdjModal.notify;
    const labelMsg = jekoAdjModal.label;
    const res = await manualJekoAdjustment(memberId, pts, labelMsg);
    setJekoAdjSaving(false);
    if (res.ok) {
      setJekoAdjMsg({ ok: true, text: `${pts > 0 ? '+' : ''}${pts} pts appliqués ✓` });
      getJekoMembers().then(setJekoMembers);
      getAllJekoTransactions().then(setJekoTxns);
      getJekoStats().then(setJekoStats);
      if (shouldNotify) {
        fetch('/api/jeko/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: memberId, points: pts, message: labelMsg }),
        })
          .then(r => r.json())
          .then(d => {
            if (!d.ok) console.warn('[jeko/notify] échec:', d.error);
          })
          .catch(err => console.warn('[jeko/notify] exception:', err));
      }
      setTimeout(() => { setJekoAdjModal(null); setJekoAdjMsg(null); }, 1800);
    } else {
      setJekoAdjMsg({ ok: false, text: res.error ?? 'Erreur' });
    }
  };
  const loadMemberTxns = async (uid: string) => {
    if (jekoMemberTxns[uid]) return;
    const txns = await getAllJekoTransactions(uid);
    setJekoMemberTxns(prev => ({ ...prev, [uid]: txns }));
  };

  // Pré-défini hors de l'arbre JSX pour éviter un bug TypeScript 5.9 d'inférence de profondeur
  const trustItemsBlock = (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <p className="text-sm font-semibold" style={{ color: GOLD }}>✅ Barre de confiance (5 items)</p>
      {siteContent.trust_items.map((item, i) => (
        <label key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="text-xs" style={{ color: TEXT2 }}>Item {i + 1}</span>
          <textarea value={item.label} rows={2} onChange={e => setSiteContent(c => ({ ...c, trust_items: c.trust_items.map((it, j) => j === i ? { ...it, label: e.target.value } : it) }))}
            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', resize: 'vertical', outline: 'none' }} />
        </label>
      ))}
      <button
        onClick={async () => {
          setContentSaving(s => ({ ...s, trust_items: true }));
          await saveSiteConfigSection('trust_items', siteContent.trust_items);
          setContentSaving(s => ({ ...s, trust_items: false }));
          setContentSaved(s => ({ ...s, trust_items: true }));
          setTimeout(() => setContentSaved(s => ({ ...s, trust_items: false })), 2500);
        }}
        disabled={contentSaving.trust_items}
        style={{ alignSelf: 'flex-end', background: contentSaved.trust_items ? S_SAVE_BG : GOLD2, color: contentSaved.trust_items ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
        {contentSaved.trust_items ? '✓ Sauvegardé' : contentSaving.trust_items ? '…' : '💾 Sauvegarder'}
      </button>
    </div>
  );

  // Sections topbar + hero pré-déclarées hors JSX tree pour éviter le bug d'inférence TS 5.9
  const contenutTopSectionsBlock = (
    <>
      {/* ── Barre du haut ── */}
      {(() => {
        const save = async () => {
          setContentSaving(s => ({ ...s, topbar: true }));
          await saveSiteConfigSection('topbar', siteContent.topbar);
          setContentSaving(s => ({ ...s, topbar: false }));
          setContentSaved(s => ({ ...s, topbar: true }));
          setTimeout(() => setContentSaved(s => ({ ...s, topbar: false })), 2500);
        };
        return (
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p className="text-sm font-semibold" style={{ color: GOLD }}>📢 Barre du haut</p>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="text-xs" style={{ color: TEXT2 }}>Message</span>
              <input value={siteContent.topbar.message} onChange={e => setSiteContent(c => ({ ...c, topbar: { ...c.topbar, message: e.target.value } }))}
                style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="text-xs" style={{ color: TEXT2 }}>Téléphone</span>
              <input value={siteContent.topbar.phone} onChange={e => setSiteContent(c => ({ ...c, topbar: { ...c.topbar, phone: e.target.value } }))}
                style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
            </label>
            <button onClick={save} disabled={contentSaving.topbar}
              style={{ alignSelf: 'flex-end', background: contentSaved.topbar ? S_SAVE_BG : GOLD2, color: contentSaved.topbar ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              {contentSaved.topbar ? '✓ Sauvegardé' : contentSaving.topbar ? '…' : '💾 Sauvegarder'}
            </button>
          </div>
        );
      })()}

      {/* ── Bannière Hero ── */}
      {(() => {
        const save = async () => {
          setContentSaving(s => ({ ...s, hero: true }));
          await saveSiteConfigSection('hero', siteContent.hero);
          setContentSaving(s => ({ ...s, hero: false }));
          setContentSaved(s => ({ ...s, hero: true }));
          setTimeout(() => setContentSaved(s => ({ ...s, hero: false })), 2500);
        };
        const f = siteContent.hero;
        return (
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p className="text-sm font-semibold" style={{ color: GOLD }}>🖼 Bannière Hero</p>
            {([
              ['eyebrow', 'Accroche (texte au-dessus)'],
              ['title', 'Titre principal'],
              ['titleAccent', "Titre (partie en accent doré)"],
              ['lead', 'Sous-titre / lead'],
              ['ctaText', 'Texte du bouton CTA'],
              ['ctaHref', 'Lien du bouton CTA'],
              ['imageAlt', "Texte alternatif de l'image"],
            ] as [keyof typeof f, string][]).map(([key, label]) => (
              <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="text-xs" style={{ color: TEXT2 }}>{label}</span>
                <input value={f[key] as string} onChange={e => setSiteContent(c => ({ ...c, hero: { ...c.hero, [key]: e.target.value } }))}
                  style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
              </label>
            ))}
            <ImageUpload
              value={f.image}
              onChange={url => setSiteContent(c => ({ ...c, hero: { ...c.hero, image: url } }))}
              folder="hero"
              label="Image du hero"
              previewSize={160}
            />
            <button onClick={save} disabled={contentSaving.hero}
              style={{ alignSelf: 'flex-end', background: contentSaved.hero ? S_SAVE_BG : GOLD2, color: contentSaved.hero ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              {contentSaved.hero ? '✓ Sauvegardé' : contentSaving.hero ? '…' : '💾 Sauvegarder'}
            </button>
          </div>
        );
      })()}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 0 calc(220px + 24px)', background: 'rgba(13,9,6,0.90)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT2, letterSpacing: '0.05em' }}>Tableau de bord</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {userEmail && (
            <span style={{ fontSize: '11px', color: TEXT3, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: S_SAVE_T, display: 'inline-block', boxShadow: `0 0 6px ${S_SAVE_T}` }} />
              {userEmail}
            </span>
          )}
          <Link href="/" style={{ fontSize: '11px', color: TEXT2, padding: '6px 12px', borderRadius: '6px', background: SURFACE, border: `1px solid ${BORDER}`, textDecoration: 'none' }}>← Voir le site</Link>
          <button onClick={handleLogout} style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px', background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT3, cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px', background: 'linear-gradient(180deg, #1a1410 0%, #141108 100%)', borderRight: `2px solid ${GOLD_D3}`, display: 'flex', flexDirection: 'column', zIndex: 200, boxShadow: '4px 0 20px rgba(0,0,0,0.3)' }}>
          {/* Logo */}
          <div style={{ height: '70px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: `1px solid ${GOLD_D3}`, gap: '12px', flexShrink: 0, background: 'rgba(212,162,90,0.08)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, ${GOLD}, #E5B366)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 4px 12px rgba(212,162,90,0.3)' }}>✦</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#F7EFE5', letterSpacing: '0.08em' }}>SD COSMETIQUE</div>
              <div style={{ fontSize: '10px', color: GOLD, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Administration</div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '18px 16px', overflowY: 'auto' }}>
            <div style={{ fontSize: '10px', color: '#8B7355', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 12px', margin: '8px 0 10px', fontWeight: 700 }}>● PRINCIPAL</div>
            {([
              { id: 'dashboard',    label: 'Tableau de bord', icon: '▣', status: 'active' },
              { id: 'commandes',    label: 'Commandes',        icon: '◫', status: ordersInProgress > 0 ? 'alert' : 'normal' },
              { id: 'produits',     label: 'Produits',         icon: '◇', status: 'normal' },
              { id: 'avis',         label: 'Avis',             icon: '★', status: reviews.filter(r => !r.verified).length > 0 ? 'warning' : 'normal' },
            ] as { id: Tab; label: string; icon: string; status: string }[]).map(item => {
              const isActive = tab === item.id;
              const bgColor = isActive ? 'linear-gradient(90deg, rgba(212,162,90,0.18) 0%, rgba(212,162,90,0.08) 100%)' : 'transparent';
              const borderColor = isActive ? GOLD : 'transparent';
              return (
                <button key={item.id} onClick={() => setTab(item.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', textAlign: 'left', cursor: 'pointer', border: 'none', marginBottom: '4px', transition: 'all .2s ease', background: bgColor, color: isActive ? '#F7EFE5' : '#C4A574', fontWeight: isActive ? 700 : 500, borderLeft: `3px solid ${borderColor}`, boxShadow: isActive ? '0 2px 8px rgba(212,162,90,0.15)' : 'none' }}>
                  <span style={{ fontSize: '15px', opacity: isActive ? 1 : 0.8, color: isActive ? GOLD : '#A8956B' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.id === 'commandes' && ordersInProgress > 0 && (
                    <span style={{ fontSize: '11px', background: 'linear-gradient(135deg, #DC2626, #B91C1C)', color: '#FEE2E2', padding: '3px 8px', borderRadius: '99px', fontWeight: 700, boxShadow: '0 2px 4px rgba(220,38,38,0.3)' }}>{ordersInProgress}</span>
                  )}
                  {item.id === 'avis' && reviews.filter(r => !r.verified).length > 0 && (
                    <span style={{ fontSize: '11px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#FEF3C7', padding: '3px 8px', borderRadius: '99px', fontWeight: 700, boxShadow: '0 2px 4px rgba(245,158,11,0.3)' }}>{reviews.filter(r => !r.verified).length}</span>
                  )}
                </button>
              );
            })}
            
            <div style={{ fontSize: '10px', color: '#8B7355', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 12px', margin: '16px 0 10px', fontWeight: 700 }}>● CONTENU</div>
            {([
              { id: 'temoignages', label: 'Témoignages', icon: '💬', status: 'normal' },
              { id: 'categories',  label: 'Catégories',  icon: '🗂', status: 'normal' },
              { id: 'quiz',        label: 'Quiz',         icon: '🎯', status: 'normal' },
            ] as { id: Tab; label: string; icon: string; status: string }[]).map(item => {
              const isActive = tab === item.id;
              const bgColor = isActive ? 'linear-gradient(90deg, rgba(212,162,90,0.18) 0%, rgba(212,162,90,0.08) 100%)' : 'transparent';
              const borderColor = isActive ? GOLD : 'transparent';
              return (
                <button key={item.id} onClick={() => setTab(item.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', textAlign: 'left', cursor: 'pointer', border: 'none', marginBottom: '4px', transition: 'all .2s ease', background: bgColor, color: isActive ? '#F7EFE5' : '#C4A574', fontWeight: isActive ? 700 : 500, borderLeft: `3px solid ${borderColor}`, boxShadow: isActive ? '0 2px 8px rgba(212,162,90,0.15)' : 'none' }}>
                  <span style={{ fontSize: '15px', opacity: isActive ? 1 : 0.8, color: isActive ? GOLD : '#A8956B' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                </button>
              );
            })}
            
            <div style={{ fontSize: '10px', color: '#8B7355', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 12px', margin: '16px 0 10px', fontWeight: 700 }}>● GESTION</div>
            {([
              { id: 'clients',   label: 'Clients',    icon: '👤', status: 'normal' },
              { id: 'jeko',      label: 'Fidélité ✦',  icon: '✦', status: 'premium' },
              { id: 'newsletter', label: 'Newsletter', icon: '✉', status: 'normal' },
              { id: 'marketing', label: 'Marketing',   icon: '📣', status: 'important' },
              { id: 'livraison', label: 'Livraison',  icon: '🚚', status: 'normal' },
              { id: 'contenu',   label: 'Contenu',    icon: '✏️', status: 'normal' },
            ] as { id: Tab; label: string; icon: string; status: string }[]).map(item => {
              const isActive = tab === item.id;
              let bgColor = isActive ? 'linear-gradient(90deg, rgba(212,162,90,0.18) 0%, rgba(212,162,90,0.08) 100%)' : 'transparent';
              if (item.status === 'premium' && !isActive) bgColor = 'linear-gradient(90deg, rgba(212,162,90,0.08) 0%, rgba(212,162,90,0.04) 100%)';
              if (item.status === 'important' && !isActive) bgColor = 'linear-gradient(90deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 100%)';
              const borderColor = isActive ? GOLD : 'transparent';
              return (
                <button key={item.id} onClick={() => setTab(item.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', textAlign: 'left', cursor: 'pointer', border: 'none', marginBottom: '4px', transition: 'all .2s ease', background: bgColor, color: isActive ? '#F7EFE5' : '#C4A574', fontWeight: isActive ? 700 : 500, borderLeft: `3px solid ${borderColor}`, boxShadow: isActive ? '0 2px 8px rgba(212,162,90,0.15)' : 'none' }}>
                  <span style={{ fontSize: '15px', opacity: isActive ? 1 : 0.8, color: isActive ? GOLD : (item.status === 'premium' ? '#E5B366' : item.status === 'important' ? '#10B981' : '#A8956B') }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.status === 'premium' && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700, #FFC107)', boxShadow: '0 0 8px rgba(255,215,0,0.5)' }} />
                  )}
                  {item.status === 'important' && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
                  )}
              </button>
              );
            })}
          </nav>

          {/* Footer sidebar */}
          <div style={{ padding: '18px 20px', borderTop: `1px solid ${GOLD_D3}`, display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(212,162,90,0.06)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD}, #E5B366)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#1A1410', flexShrink: 0, boxShadow: '0 3px 8px rgba(212,162,90,0.3)', border: '2px solid rgba(255,255,255,0.2)' }}>AD</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#F7EFE5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin</div>
              <div style={{ fontSize: '10px', color: GOLD, fontWeight: 600, letterSpacing: '0.04em' }}>● En ligne</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button onClick={() => router.push('/')} style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(212,162,90,0.15)', border: 'none', color: GOLD, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }} title="Voir le site">👁</button>
              <button onClick={handleLogout} style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(220,38,38,0.15)', border: 'none', color: '#F87171', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }} title="Déconnexion">⏻</button>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ marginLeft: '260px', flex: 1, overflowY: 'auto', padding: '32px', background: 'linear-gradient(180deg, #0F0C08 0%, #1A1410 100%)' }}>

          {/* ─── DASHBOARD TAB ─── */}
          {tab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Page title */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: 700, color: TITLE, letterSpacing: '-0.02em' }}>Tableau de bord</h1>
                  <p style={{ fontSize: '12px', color: TEXT3, marginTop: '2px' }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <button onClick={() => setTab('commandes')} style={{ fontSize: '11px', padding: '7px 14px', borderRadius: '8px', border: `1px solid ${BORDER2}`, background: SURFACE2, color: TEXT2, cursor: 'pointer' }}>Toutes les commandes →</button>
              </div>

              {/* KPI grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                {[
                  { label: 'Chiffre d\'affaires', value: formatPrice(totalRevenue), sub: 'Toutes commandes', pct: 100, icon: '◈', color: GOLD },
                  { label: 'CA ce mois', value: formatPrice(revenueThisMonth), sub: new Date().toLocaleDateString('fr-FR', { month: 'long' }), pct: totalRevenue > 0 ? Math.round((revenueThisMonth / totalRevenue) * 100) : 0, icon: '▲', color: S_OK_T },
                  { label: 'Commandes totales', value: String(orders.length), sub: 'Depuis le début', pct: 100, icon: '◫', color: S_INFO_T },
                  { label: 'En attente', value: String(ordersInProgress), sub: ordersInProgress > 0 ? 'À traiter' : 'Tout est traité ✓', pct: orders.length > 0 ? Math.round((ordersInProgress / orders.length) * 100) : 0, icon: '⏳', color: S_ERR_T },
                  { label: 'Produits', value: String(editableProducts.length || PRODUCTS.length), sub: 'Dans le catalogue', pct: 100, icon: '◇', color: ACCENT_P },
                  { label: 'Avis clients', value: String(reviews.length), sub: `${reviews.filter(r => r.verified).length} vérifiés`, pct: reviews.length > 0 ? Math.round((reviews.filter(r => r.verified).length / reviews.length) * 100) : 0, icon: '★', color: ACCENT_Y },
                  ...(() => {
                    const tracked = editableProducts.filter(p => p.stockQty != null);
                    const low = tracked.filter(p => (p.stockQty ?? 0) > 0 && (p.stockQty ?? 0) <= (p.lowStockThreshold ?? 5)).length;
                    const out = tracked.filter(p => (p.stockQty ?? 0) <= 0).length;
                    return [{ label: 'Stock à surveiller', value: String(low + out), sub: out > 0 ? `${out} en rupture` : `${low} stock bas`, pct: tracked.length > 0 ? Math.round(((low + out) / tracked.length) * 100) : 0, icon: '◰', color: out > 0 ? S_ERR_T : S_WARN_T }];
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
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '100%', height: `${maxDay > 0 ? Math.max(Math.round((d.value / maxDay) * 80), d.value > 0 ? 6 : 2) : 2}px`, background: d.value > 0 ? `linear-gradient(180deg, ${GOLD}, ${GOLD_D})` : SURFACE2, borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease', cursor: 'default' }} title={d.value > 0 ? formatPrice(d.value) : '0'} />
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
                  <button onClick={() => setTab('commandes')} style={{ fontSize: '11px', color: GOLD, background: 'none', border: 'none', cursor: 'pointer' }}>Voir tout →</button>
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
                            onClick={() => setOrderDetail(o)}>
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
              {/* Top ventes + Newsletter */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
                {/* Top ventes */}
                {(() => {
                  const agg = new Map<string, { name: string; image?: string; qty: number; revenue: number }>();
                  for (const o of orders) {
                    for (const it of o.items) {
                      const id = it.product.id;
                      const cur = agg.get(id) ?? { name: it.product.name, image: it.product.images?.[0], qty: 0, revenue: 0 };
                      cur.qty += it.quantity;
                      cur.revenue += it.product.price * it.quantity;
                      agg.set(id, cur);
                    }
                  }
                  const top = [...agg.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
                  const max = top[0]?.revenue ?? 0;
                  return (
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px' }}>
                      <h2 style={{ fontSize: '13px', fontWeight: 600, color: TITLE, marginBottom: '14px' }}>Top ventes</h2>
                      {top.length === 0 ? (
                        <p style={{ fontSize: '12px', color: TEXT3 }}>Aucune vente enregistrée.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {top.map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '11px', color: TEXT3, width: '14px' }}>{i + 1}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: TEXT2, marginBottom: '4px' }}>
                                  <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{p.name}</span>
                                  <span style={{ color: GOLD, fontWeight: 600 }}>{formatPrice(p.revenue)}</span>
                                </div>
                                <div style={{ height: '4px', background: SURFACE2, borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${max > 0 ? Math.round((p.revenue / max) * 100) : 0}%`, background: `linear-gradient(90deg, ${GOLD}, ${GOLD_D})`, borderRadius: '2px' }} />
                                </div>
                                <div style={{ fontSize: '10px', color: TEXT3, marginTop: '3px' }}>{p.qty} unité{p.qty > 1 ? 's' : ''} vendue{p.qty > 1 ? 's' : ''}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Newsletter card */}
                {(() => {
                  return (
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h2 style={{ fontSize: '13px', fontWeight: 600, color: TITLE }}>Newsletter</h2>
                      <NewsletterCard />
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ─── COMMANDES TAB ─── */}
          {tab === 'commandes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-lg font-bold" style={{ color: TEXT }}>
                  Commandes ({filteredOrders.length}{filteredOrders.length !== orders.length ? ` / ${orders.length}` : ''})
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="search" placeholder="Rechercher N°, client, email…"
                    value={orderSearch}
                    onChange={e => { setOrderSearch(e.target.value); setOrderPage(1); }}
                    style={{ ...inputStyle, width: '200px' }}
                  />
                  <select value={orderStatusFilter}
                    onChange={e => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
                    style={{ ...inputStyle, width: '140px', cursor: 'pointer' }}>
                    <option value="">Tous statuts</option>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <button
                    onClick={() => exportOrdersCSV(filteredOrders)}
                    className="text-xs px-3 py-1.5 rounded border transition-all hover:opacity-80"
                    style={{ borderColor: GOLD, color: GOLD, whiteSpace: 'nowrap' }}
                    disabled={orders.length === 0}
                  >
                    ↓ CSV
                  </button>
                </div>
              </div>

              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {filteredOrders.length === 0 ? (
                  <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>
                    {orders.length === 0 ? 'Aucune commande pour le moment.' : 'Aucun résultat pour cette recherche.'}
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ background: SURFACE2 }}>
                          <tr>{['N°', 'Date', 'Client', 'Email', 'Articles', 'Total', 'Paiement', 'Statut', ''].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
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
                                <select
                                  value={o.status}
                                  onChange={e => handleStatusChange(o.orderNumber, e.target.value as OrderStatus)}
                                  style={{ background: BG, border: `1px solid ${BORDER2}`, borderRadius: '6px', color: STATUS_OPTIONS.find(s => s.value === o.status)?.color ?? TEXT, padding: '3px 6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  {STATUS_OPTIONS.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td style={tdStyle}>
                                <button onClick={() => setOrderDetail(o)}
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
                    {orderPageCount > 1 && <Pagination page={orderPage} total={orderPageCount} onChange={setOrderPage} />}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─── PRODUITS TAB ─── */}
          {tab === 'produits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-lg font-bold" style={{ color: TEXT }}>
                  Produits ({filteredProducts.length}{filteredProducts.length !== editableProducts.length ? ` / ${editableProducts.length}` : ''})
                </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={openNewModal} className="text-xs px-3 py-1.5 rounded transition-all hover:opacity-80" style={{ background: GOLD, color: BG, fontWeight: 600, whiteSpace: 'nowrap' }}>+ Nouveau</button>
                  <input
                    type="search" placeholder="Rechercher un produit…"
                    value={productSearch}
                    onChange={e => { setProductSearch(e.target.value); setProductPage(1); }}
                    style={{ ...inputStyle, width: '180px' }}
                  />
                  <select
                    value={productCatFilter}
                    onChange={e => { setProductCatFilter(e.target.value); setProductPage(1); }}
                    style={{ ...inputStyle, width: '130px', cursor: 'pointer' }}
                  >
                    <option value="">Toutes catégories</option>
                    <option value="face">Visage</option>
                    <option value="body">Corps</option>
                    <option value="gammes">Gammes</option>
                    <option value="kits">Kits</option>
                    <option value="duo">Duo</option>
                  </select>
                </div>
              </div>

              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {filteredProducts.length === 0 ? (
                  <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>Aucun produit trouvé.</p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ background: SURFACE2 }}>
                          <tr>{['', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Badges', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {pagedProducts.map(p => (
                            <tr key={p.id} style={{ transition: 'background .15s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = SURFACE2)}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                              <td style={{ ...tdStyle, width: '52px', padding: '8px 8px 8px 16px' }}>
                                {p.images?.[0] ? (
                                  <Image src={p.images[0]} alt={p.name} width={38} height={38} style={{  objectFit: 'cover', borderRadius: '6px', border: `1px solid ${BORDER}`  }} />
                                ) : (
                                  <div style={{ width: '38px', height: '38px', background: BORDER, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: TEXT3, fontSize: '16px' }}>◇</span>
                                  </div>
                                )}
                              </td>
                              <td style={{ ...tdStyle, fontWeight: 500 }}>{p.name}</td>
                              <td style={{ ...tdStyle, color: INFO_C }}>{p.category}</td>
                              <td style={{ ...tdStyle, fontWeight: 600, color: GOLD }}>
                                {formatPrice(p.price)}
                                {p.originalPrice && (
                                  <span style={{ color: TEXT3, fontWeight: 400, fontSize: '11px', marginLeft: '4px' }}><s>{formatPrice(p.originalPrice)}</s></span>
                                )}
                              </td>
                              <td style={{ ...tdStyle, textAlign: 'center' as const }}>
                                {(() => {
                                  const qty = p.stockQty;
                                  const threshold = p.lowStockThreshold ?? 5;
                                  if (qty == null) {
                                    return <span style={{ color: p.inStock ? S_OK_T : S_ERR_T, fontSize: '13px', fontWeight: 700 }}>{p.inStock ? '✓' : '✕'}</span>;
                                  }
                                  if (qty <= 0) return <span style={{ color: S_ERR_T, fontSize: '12px', fontWeight: 700 }}>Rupture</span>;
                                  if (qty <= threshold) return <span style={{ color: S_WARN_T, fontSize: '12px', fontWeight: 700 }}>{qty} ⚠</span>;
                                  return <span style={{ color: S_OK_T, fontSize: '12px', fontWeight: 600 }}>{qty}</span>;
                                })()}
                              </td>
                              <td style={tdStyle}>
                                <div className="flex flex-wrap gap-1">
                                  {p.isNew && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: S_INFO_BG, color: S_INFO_T }}>Nouveau</span>}
                                  {p.isBestseller && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: S_ERR_BG, color: S_ERR_T }}>Bestseller</span>}
                                  {p.originalPrice && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: S_WARN_BG, color: S_WARN_T }}>Promo</span>}
                                </div>
                              </td>
                              <td style={tdStyle}>
                                <div className="flex gap-1">
                                  <a href={`/produit/${p.slug}`} target="_blank" rel="noopener noreferrer" title="Aperçu live"
                                    className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80"
                                    style={{ borderColor: BORDER2, color: GOLD, textDecoration: 'none' }}>↗</a>
                                  <button onClick={() => openEditModal(p)} className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80" style={{ borderColor: BORDER2, color: TEXT2 }}>Éditer</button>
                                  <button onClick={() => setConfirmDelete(p.id)} className="text-xs px-2 py-1 rounded transition-all hover:opacity-80" style={{ background: S_ERR_BG, color: S_ERR_T }}>✕</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {productPageCount > 1 && <Pagination page={productPage} total={productPageCount} onChange={setProductPage} />}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─── AVIS TAB ─── */}
          {tab === 'avis' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-lg font-bold" style={{ color: TEXT }}>
                  Avis ({filteredReviews.length}{filteredReviews.length !== reviews.length ? ` / ${reviews.length}` : ''})
                </h1>
                <input type="search" placeholder="Rechercher auteur, commentaire…"
                  value={reviewSearch}
                  onChange={e => { setReviewSearch(e.target.value); setReviewPage(1); }}
                  style={{ ...inputStyle, width: '220px' }}
                />
              </div>
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {filteredReviews.length === 0 ? (
                  <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>
                    {reviews.length === 0 ? 'Aucun avis enregistré.' : 'Aucun résultat.'}
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ background: SURFACE2 }}>
                          <tr>{['Auteur', 'Note', 'Commentaire', 'Date', 'Statut', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {pagedReviews.map(r => (
                            <tr key={r.id} style={{ background: 'transparent' }} className="hover:brightness-110 transition-all">
                              <td style={{ ...tdStyle, fontWeight: 600 }}>{r.author}</td>
                              <td style={tdStyle}><span style={{ color: GOLD }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span></td>
                              <td style={{ ...tdStyle, maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.comment}</td>
                              <td style={{ ...tdStyle, color: TEXT3, whiteSpace: 'nowrap' }}>{new Date(r.date).toLocaleDateString('fr-FR')}</td>
                              <td style={tdStyle}>
                                {r.verified
                                  ? <span style={{ background: S_OK_BG, color: S_OK_T, borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>Vérifié</span>
                                  : <span style={{ background: S_WARN_BG, color: S_WARN_T, borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>En attente</span>
                                }
                              </td>
                              <td style={tdStyle}>
                                <div className="flex gap-1">
                                  <button onClick={() => handleToggleReview(r.id, r.verified)}
                                    className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80"
                                    style={{ borderColor: r.verified ? BORDER3 : S_OK_BG, color: r.verified ? TEXT2 : S_OK_T }}>
                                    {r.verified ? 'Retirer' : '✓ Approuver'}
                                  </button>
                                  <button onClick={() => handleDeleteReview(r.id)} className="text-xs px-2 py-1 rounded transition-all hover:opacity-80" style={{ background: S_ERR_BG, color: S_ERR_T }}>✕</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {reviewPageCount > 1 && <Pagination page={reviewPage} total={reviewPageCount} onChange={setReviewPage} />}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─── TÉMOIGNAGES TAB ─── */}
          {tab === 'temoignages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-lg font-bold" style={{ color: TEXT }}>
                  Témoignages clients ({testimonials.filter(t => testiSearch ? t.name.toLowerCase().includes(testiSearch.toLowerCase()) || t.text.toLowerCase().includes(testiSearch.toLowerCase()) : true).length})
                </h1>
                <input type="search" placeholder="Rechercher nom, message…"
                  value={testiSearch}
                  onChange={e => setTestiSearch(e.target.value)}
                  style={{ ...inputStyle, width: '220px' }}
                />
              </div>
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {testimonials.length === 0 ? (
                  <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>
                    Aucun témoignage soumis pour l&apos;instant.
                  </p>
                ) : (() => {
                  const filtered = testimonials.filter(t =>
                    !testiSearch || t.name.toLowerCase().includes(testiSearch.toLowerCase()) || t.text.toLowerCase().includes(testiSearch.toLowerCase())
                  );
                  return filtered.length === 0 ? (
                    <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>Aucun résultat.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ background: SURFACE2 }}>
                          <tr>{['Photo', 'Auteur', 'Message', 'Date', 'Statut', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {filtered.map(t => (
                            <tr key={t.id} style={{ background: 'transparent' }} className="hover:brightness-110 transition-all">
                              <td style={{ ...tdStyle, width: '52px' }}>
                                {t.avatar_url ? (
                                  <Image src={t.avatar_url} alt={t.name} width={38} height={38} style={{  objectFit: 'cover', borderRadius: '50%', border: `1px solid ${BORDER}`  }} />
                                ) : (
                                  <div style={{ width: '38px', height: '38px', background: BORDER, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: TEXT3, fontSize: '18px' }}>👤</span>
                                  </div>
                                )}
                              </td>
                              <td style={{ ...tdStyle, fontWeight: 600 }}>{t.name}</td>
                              <td style={{ ...tdStyle, maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.text}</td>
                              <td style={{ ...tdStyle, color: TEXT3, whiteSpace: 'nowrap' }}>{new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
                              <td style={tdStyle}>
                                {t.approved
                                  ? <span style={{ background: S_OK_BG, color: S_OK_T, borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>Approuvé</span>
                                  : <span style={{ background: S_WARN_BG, color: S_WARN_T, borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>En attente</span>
                                }
                              </td>
                              <td style={tdStyle}>
                                <div className="flex gap-1">
                                  <button
                                    onClick={async () => {
                                      await approveTestimonialInDB(t.id, !t.approved);
                                      setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, approved: !t.approved } : x));
                                    }}
                                    className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80"
                                    style={{ borderColor: t.approved ? BORDER3 : S_OK_BG, color: t.approved ? TEXT2 : S_OK_T }}>
                                    {t.approved ? 'Retirer' : '✓ Approuver'}
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await deleteTestimonialFromDB(t.id);
                                      setTestimonials(prev => prev.filter(x => x.id !== t.id));
                                    }}
                                    className="text-xs px-2 py-1 rounded transition-all hover:opacity-80"
                                    style={{ background: S_ERR_BG, color: S_ERR_T }}>✕
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ─── CATEGORIES TAB ─── */}
          {tab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-lg font-bold" style={{ color: TEXT }}>
                  Catégories ({categories.length})
                </h1>
                <button
                  onClick={() => setCatModal({ _isNew: true, slug: '', label: '', sub_label: '', image: '', href: '', icon: '', is_quiz: false, order_index: categories.length + 1, active: true })}
                  className="text-xs px-3 py-2 rounded font-semibold transition-all hover:opacity-80"
                  style={{ background: GOLD, color: BG }}
                >
                  + Nouvelle catégorie
                </button>
              </div>
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {categories.length === 0 ? (
                  <p className="text-xs text-center py-10" style={{ color: TEXT3 }}>Aucune catégorie.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ background: SURFACE2 }}>
                        <tr>{['Image', 'Label', 'Sous-titre', 'Slug', 'Lien', 'Ordre', 'Actif', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {categories.map(cat => (
                          <tr key={cat.id} style={{ background: 'transparent' }} className="hover:brightness-110 transition-all">
                            <td style={{ ...tdStyle, width: '52px', padding: '8px' }}>
                              {cat.image ? (
                                <Image src={cat.image} alt={cat.label} width={38} height={38} style={{  objectFit: 'cover', borderRadius: '50%', border: `1px solid ${BORDER}`  }} />
                              ) : (
                                <div style={{ width: '38px', height: '38px', background: BORDER, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span style={{ color: TEXT3, fontSize: '18px' }}>{cat.is_quiz ? '🎯' : '🗂️'}</span>
                                </div>
                              )}
                            </td>
                            <td style={{ ...tdStyle, fontWeight: 600 }}>{cat.label}</td>
                            <td style={{ ...tdStyle, color: TEXT_M, fontSize: '11px', whiteSpace: 'pre-line', maxWidth: '120px' }}>{cat.sub_label}</td>
                            <td style={{ ...tdStyle, color: INFO_C, fontFamily: 'monospace', fontSize: '11px' }}>{cat.slug}</td>
                            <td style={{ ...tdStyle, color: INFO_C, fontFamily: 'monospace', fontSize: '11px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.href}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' as const }}>{cat.order_index}</td>
                            <td style={{ ...tdStyle, textAlign: 'center' as const }}>
                              <span style={{ color: cat.active ? S_OK_T : S_ERR_T, fontSize: '14px', fontWeight: 700 }}>{cat.active ? '✓' : '✕'}</span>
                            </td>
                            <td style={tdStyle}>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setCatModal({ ...cat, _isNew: false })}
                                  className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80"
                                  style={{ borderColor: BORDER2, color: TEXT2 }}
                                >Éditer</button>
                                <button
                                  onClick={async () => { if (confirm(`Supprimer "${cat.label}" ?`)) { await deleteCategoryFromDB(cat.id); setCategories(prev => prev.filter(c => c.id !== cat.id)); } }}
                                  className="text-xs px-2 py-1 rounded transition-all hover:opacity-80"
                                  style={{ background: S_ERR_BG, color: S_ERR_T }}
                                >✕</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ─── Modal catégorie ─── */}
              {catModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-base" style={{ color: TEXT }}>{catModal._isNew ? 'Nouvelle catégorie' : 'Modifier la catégorie'}</h2>
                      <button onClick={() => setCatModal(null)} style={{ color: TEXT3, fontSize: '20px', lineHeight: 1 }}>✕</button>
                    </div>
                    <div className="space-y-3">
                      {/* Label → génère le slug automatiquement */}
                      <div>
                        <label className="text-xs block mb-1" style={{ color: TEXT_M }}>Label (ex: CORPS) *</label>
                        <input
                          type="text"
                          value={catModal.label ?? ''}
                          onChange={e => {
                            const label = e.target.value;
                            const slug = label.toLowerCase()
                              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                              .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                            setCatModal(prev => prev ? { ...prev, label, slug } : prev);
                          }}
                          style={{ ...inputStyle, width: '100%' }}
                        />
                      </div>
                      {/* Slug — lecture seule, généré depuis le label */}
                      <div>
                        <label className="text-xs block mb-1" style={{ color: TEXT_M }}>Slug (auto-généré)</label>
                        <input
                          type="text"
                          value={catModal.slug ?? ''}
                          readOnly
                          style={{ ...inputStyle, width: '100%', opacity: 0.5, cursor: 'not-allowed' }}
                        />
                      </div>
                      {([
                        { key: 'sub_label', label: 'Sous-titre (2 lignes avec \\n)' },
                        { key: 'image', label: 'URL de l\'image' },
                        { key: 'href', label: 'Lien (ex: /categorie/body)' },
                        { key: 'order_index', label: 'Ordre d\'affichage', type: 'number' },
                      ] as { key: keyof CategoryRow; label: string; required?: boolean; type?: string }[]).map(field => (
                        <div key={String(field.key)}>
                          <label className="text-xs block mb-1" style={{ color: TEXT_M }}>{field.label}</label>
                          <input
                            type={field.type ?? 'text'}
                            value={String(catModal[field.key] ?? '')}
                            onChange={e => setCatModal(prev => prev ? { ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value } : prev)}
                            style={{ ...inputStyle, width: '100%' }}
                          />
                        </div>
                      ))}
                      <div className="flex items-center gap-3">
                        <label className="text-xs" style={{ color: TEXT_M }}>Quiz teint</label>
                        <input type="checkbox" checked={catModal.is_quiz ?? false} onChange={e => setCatModal(prev => prev ? { ...prev, is_quiz: e.target.checked } : prev)} />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs" style={{ color: TEXT_M }}>Visible (actif)</label>
                        <input type="checkbox" checked={catModal.active ?? true} onChange={e => setCatModal(prev => prev ? { ...prev, active: e.target.checked } : prev)} />
                      </div>
                      {catModal.image && (
                        <div>
                          <label className="text-xs block mb-1" style={{ color: TEXT_M }}>Aperçu</label>
                          <Image src={catModal.image} alt="" width={60} height={60} style={{  objectFit: 'cover', borderRadius: '50%', border: `1px solid ${BORDER}`  }} />
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setCatModal(null)}
                          className="flex-1 text-xs py-2 rounded border"
                          style={{ borderColor: BORDER2, color: TEXT3 }}
                        >Annuler</button>
                        <button
                          disabled={catSaving || !catModal.label?.trim() || !catModal.slug?.trim()}
                          onClick={async () => {
                            setCatSaving(true);
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { _isNew, id, created_at: _createdAt, ...fields } = catModal as CategoryRow & { _isNew?: boolean };
                            if (_isNew) {
                              const { error } = await addCategoryToDB(fields as Omit<CategoryRow, 'id' | 'created_at'>);
                              if (!error) {
                                const fresh = await fetchAllCategoriesAdmin();
                                setCategories(fresh);
                                setCatModal(null);
                              }
                            } else {
                              await updateCategoryInDB(id, fields as Partial<Omit<CategoryRow, 'id' | 'created_at'>>);
                              setCategories(prev => prev.map(c => c.id === id ? { ...c, ...fields } : c));
                              setCatModal(null);
                            }
                            setCatSaving(false);
                          }}
                          className="flex-1 text-xs py-2 rounded font-semibold transition-all hover:opacity-80"
                          style={{ background: catSaving ? TEXT3 : GOLD, color: TITLE }}
                        >{catSaving ? 'Sauvegarde…' : 'Enregistrer'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── CLIENTS TAB ─── */}
          {tab === 'clients' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-lg font-bold" style={{ color: TEXT }}>Clients ({filteredClients.length})</h1>
                <input type="search" placeholder="Rechercher nom, email…"
                  value={clientSearch}
                  onChange={e => { setClientSearch(e.target.value); setClientPage(1); }}
                  style={{ ...inputStyle, width: '220px' }}
                />
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
          )}

          {/* ─── QUIZ TAB ─── */}
          {tab === 'quiz' && (
            <div className="space-y-8">
              <h1 className="text-lg font-bold" style={{ color: TEXT }}>Quiz — Configuration</h1>

              <QuizAnalyticsCard />

              {/* ── Préoccupations ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h2 className="text-sm font-semibold" style={{ color: GOLD }}>Préoccupations — Q2 ({quizConcerns.length})</h2>
                  <button
                    onClick={() => setQuizModal({ type: 'concern', data: { _isNew: true, id: '', label: '', meta: '', glyph: '◯', sort_order: quizConcerns.length, active: true } })}
                    className="text-xs px-3 py-2 rounded font-semibold transition-all hover:opacity-80"
                    style={{ background: GOLD, color: BG }}
                  >+ Nouvelle préoccupation</button>
                </div>
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', overflow: 'hidden' }}>
                  {quizConcerns.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: TEXT3 }}>Aucune préoccupation.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ background: SURFACE2 }}>
                          <tr>{['Glyphe', 'ID', 'Label', 'Sous-titre', 'Ordre', 'Actif', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {quizConcerns.map(c => (
                            <tr key={c.id} style={{ background: 'transparent' }} className="hover:brightness-110 transition-all">
                              <td style={{ ...tdStyle, textAlign: 'center' as const, fontSize: '20px', width: '48px' }}>{c.glyph}</td>
                              <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '11px', color: INFO_C }}>{c.id}</td>
                              <td style={{ ...tdStyle, fontWeight: 600 }}>{c.label}</td>
                              <td style={{ ...tdStyle, color: TEXT_M, fontSize: '11px' }}>{c.meta}</td>
                              <td style={{ ...tdStyle, textAlign: 'center' as const }}>{c.sort_order}</td>
                              <td style={{ ...tdStyle, textAlign: 'center' as const }}>
                                <span style={{ color: c.active ? S_OK_T : S_ERR_T, fontWeight: 700 }}>{c.active ? '✓' : '✕'}</span>
                              </td>
                              <td style={tdStyle}>
                                <div className="flex gap-1">
                                  <button onClick={() => setQuizModal({ type: 'concern', data: { ...c, _isNew: false } })} className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80" style={{ borderColor: BORDER2, color: TEXT2 }}>Éditer</button>
                                  <button onClick={async () => { if (confirm(`Supprimer "${c.label}" ?`)) { await deleteConcern(c.id); setQuizConcerns(prev => prev.filter(x => x.id !== c.id)); } }} className="text-xs px-2 py-1 rounded transition-all hover:opacity-80" style={{ background: S_ERR_BG, color: S_ERR_T }}>✕</button>
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

              {/* ── Routines ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h2 className="text-sm font-semibold" style={{ color: GOLD }}>Profils de routine — Q3 ({quizRoutines.length})</h2>
                  <button
                    onClick={() => setQuizModal({ type: 'routine', data: { _isNew: true, id: '', label: '', meta: '', glyph: '◇', sort_order: quizRoutines.length, active: true } })}
                    className="text-xs px-3 py-2 rounded font-semibold transition-all hover:opacity-80"
                    style={{ background: GOLD, color: BG }}
                  >+ Nouvelle routine</button>
                </div>
                <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '10px', overflow: 'hidden' }}>
                  {quizRoutines.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: TEXT3 }}>Aucune routine.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ background: SURFACE2 }}>
                          <tr>{['Glyphe', 'ID', 'Label', 'Sous-titre', 'Ordre', 'Actif', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {quizRoutines.map(r => (
                            <tr key={r.id} style={{ background: 'transparent' }} className="hover:brightness-110 transition-all">
                              <td style={{ ...tdStyle, textAlign: 'center' as const, fontSize: '20px', width: '48px' }}>{r.glyph}</td>
                              <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '11px', color: INFO_C }}>{r.id}</td>
                              <td style={{ ...tdStyle, fontWeight: 600 }}>{r.label}</td>
                              <td style={{ ...tdStyle, color: TEXT_M, fontSize: '11px' }}>{r.meta}</td>
                              <td style={{ ...tdStyle, textAlign: 'center' as const }}>{r.sort_order}</td>
                              <td style={{ ...tdStyle, textAlign: 'center' as const }}>
                                <span style={{ color: r.active ? S_OK_T : S_ERR_T, fontWeight: 700 }}>{r.active ? '✓' : '✕'}</span>
                              </td>
                              <td style={tdStyle}>
                                <div className="flex gap-1">
                                  <button onClick={() => setQuizModal({ type: 'routine', data: { ...r, _isNew: false } })} className="text-xs px-2 py-1 rounded border transition-all hover:opacity-80" style={{ borderColor: BORDER2, color: TEXT2 }}>Éditer</button>
                                  <button onClick={async () => { if (confirm(`Supprimer "${r.label}" ?`)) { await deleteRoutine(r.id); setQuizRoutines(prev => prev.filter(x => x.id !== r.id)); } }} className="text-xs px-2 py-1 rounded transition-all hover:opacity-80" style={{ background: S_ERR_BG, color: S_ERR_T }}>✕</button>
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

              {/* ─── Modal quiz ─── */}
              {quizModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '440px' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-base" style={{ color: TEXT }}>
                        {quizModal.data._isNew
                          ? (quizModal.type === 'concern' ? 'Nouvelle préoccupation' : 'Nouvelle routine')
                          : (quizModal.type === 'concern' ? 'Modifier la préoccupation' : 'Modifier la routine')}
                      </h2>
                      <button onClick={() => setQuizModal(null)} style={{ color: TEXT3, fontSize: '20px', lineHeight: 1 }}>✕</button>
                    </div>
                    <div className="space-y-3">
                      {/* ID — seulement pour les nouveaux */}
                      {quizModal.data._isNew && (
                        <div>
                          <label className="text-xs block mb-1" style={{ color: TEXT_M }}>ID unique (ex: taches, eclat) *</label>
                          <input
                            type="text"
                            value={quizModal.data.id ?? ''}
                            onChange={e => setQuizModal(prev => prev ? { ...prev, data: { ...prev.data, id: e.target.value.toLowerCase().replace(/\s+/g, '_') } } : prev)}
                            style={{ ...inputStyle, width: '100%' }}
                            placeholder="sans espaces, sans accents"
                          />
                        </div>
                      )}
                      {[
                        { key: 'label', label: 'Label *' },
                        { key: 'meta',  label: 'Sous-titre' },
                        { key: 'glyph', label: 'Glyphe (1 caractère)' },
                        { key: 'sort_order', label: 'Ordre', type: 'number' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="text-xs block mb-1" style={{ color: TEXT_M }}>{field.label}</label>
                          <input
                            type={field.type ?? 'text'}
                            value={String((quizModal.data as Record<string, unknown>)[field.key] ?? '')}
                            onChange={e => setQuizModal(prev => prev ? { ...prev, data: { ...prev.data, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value } } : prev)}
                            style={{ ...inputStyle, width: '100%' }}
                          />
                        </div>
                      ))}
                      <div className="flex items-center gap-3">
                        <label className="text-xs" style={{ color: TEXT_M }}>Actif</label>
                        <input
                          type="checkbox"
                          checked={quizModal.data.active ?? true}
                          onChange={e => setQuizModal(prev => prev ? { ...prev, data: { ...prev.data, active: e.target.checked } } : prev)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-5">
                      <button
                        disabled={quizSaving}
                        onClick={async () => {
                          if (!quizModal.data.id || !quizModal.data.label) return;
                          setQuizSaving(true);
                          if (quizModal.type === 'concern') {
                            await upsertConcern(quizModal.data as QuizConcern);
                            setQuizConcerns(await fetchAllConcernsAdmin());
                          } else {
                            await upsertRoutine(quizModal.data as QuizRoutine);
                            setQuizRoutines(await fetchAllRoutinesAdmin());
                          }
                          setQuizSaving(false);
                          setQuizModal(null);
                        }}
                        className="flex-1 py-2 rounded font-semibold text-sm transition-all hover:opacity-80"
                        style={{ background: GOLD, color: BG, opacity: quizSaving ? 0.6 : 1 }}
                      >
                        {quizSaving ? 'Enregistrement…' : 'Enregistrer'}
                      </button>
                      <button onClick={() => setQuizModal(null)} className="flex-1 py-2 rounded text-sm" style={{ background: SURFACE2, color: TEXT2 }}>Annuler</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── NEWSLETTER TAB ─── */}
          {tab === 'newsletter' && (() => {
            const q = newsletterSearch.trim().toLowerCase();
            const filtered = newsletterSubs.filter(s => {
              if (newsletterFilter === 'active' && s.unsubscribed) return false;
              if (newsletterFilter === 'unsubscribed' && !s.unsubscribed) return false;
              if (q && !s.email.toLowerCase().includes(q)) return false;
              return true;
            });
            const total = newsletterSubs.length;
            const active = newsletterSubs.filter(s => !s.unsubscribed).length;
            const unsubs = total - active;
            const toggleUnsub = async (s: NewsletterSub) => {
              const r = await fetch('/api/newsletter/manage', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: s.id, unsubscribed: !s.unsubscribed }),
              });
              if (r.ok) reloadNewsletter();
              else alert('Erreur lors de la mise à jour');
            };
            const remove = async (s: NewsletterSub) => {
              if (!confirm(`Supprimer définitivement ${s.email} ?`)) return;
              const r = await fetch(`/api/newsletter/manage?id=${encodeURIComponent(s.id)}`, { method: 'DELETE' });
              if (r.ok) reloadNewsletter();
              else alert('Erreur lors de la suppression');
            };
            return (
              <div className="space-y-6">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h1 className="text-lg font-bold" style={{ color: TEXT }}>Newsletter</h1>
                    <p className="text-xs" style={{ color: TEXT3 }}>Gérer les abonnés à la newsletter.</p>
                  </div>
                  <a href="/api/newsletter/list?format=csv" download
                    style={{ fontSize: 12, padding: '8px 14px', borderRadius: 8, border: `1px solid ${BORDER2}`, background: 'rgba(200,151,74,0.08)', color: GOLD, textDecoration: 'none', fontWeight: 600 }}>
                    ⬇ Exporter CSV
                  </a>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { k: 'Total', v: total, c: TEXT },
                    { k: 'Actifs', v: active, c: GOLD },
                    { k: 'Désinscrits', v: unsubs, c: TEXT3 },
                  ].map(s => (
                    <div key={s.k} style={{ padding: 14, border: `1px solid ${BORDER}`, borderRadius: 10, background: '#15110B' }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT3, marginBottom: 6 }}>{s.k}</div>
                      <div style={{ fontSize: 26, fontWeight: 700, color: s.c }}>{s.v}</div>
                    </div>
                  ))}
                </div>

                {/* Filtres */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text" placeholder="Rechercher un email…"
                    value={newsletterSearch}
                    onChange={e => setNewsletterSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 220, padding: '8px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: '#0F0B07', color: TEXT, fontSize: 12 }}
                  />
                  {(['all', 'active', 'unsubscribed'] as const).map(f => (
                    <button key={f} onClick={() => setNewsletterFilter(f)}
                      style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${newsletterFilter === f ? GOLD : BORDER}`, background: newsletterFilter === f ? 'rgba(200,151,74,0.12)' : 'transparent', color: newsletterFilter === f ? GOLD : TEXT2, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                      {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Désinscrits'}
                    </button>
                  ))}
                </div>

                {/* Table */}
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', background: '#15110B' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 140px', gap: 0, padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, fontSize: 10, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <div>Email</div>
                    <div>Source</div>
                    <div>Date</div>
                    <div>Statut</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                  </div>
                  {filtered.length === 0 && (
                    <div style={{ padding: 24, textAlign: 'center', color: TEXT3, fontSize: 12 }}>Aucun abonné.</div>
                  )}
                  {filtered.map(s => (
                    <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 140px', gap: 0, padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, fontSize: 12, color: TEXT, alignItems: 'center' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</div>
                      <div style={{ color: TEXT2, fontSize: 11 }}>{s.source ?? '—'}</div>
                      <div style={{ color: TEXT2, fontSize: 11 }}>{new Date(s.created_at).toLocaleDateString('fr-FR')}</div>
                      <div>
                        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, background: s.unsubscribed ? 'rgba(150,100,80,0.12)' : 'rgba(74,200,130,0.12)', color: s.unsubscribed ? '#B88876' : '#7AC894' }}>
                          {s.unsubscribed ? 'Désinscrit' : 'Actif'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => toggleUnsub(s)}
                          style={{ padding: '5px 9px', borderRadius: 6, border: `1px solid ${BORDER2}`, background: 'transparent', color: TEXT2, fontSize: 10, cursor: 'pointer' }}>
                          {s.unsubscribed ? 'Réactiver' : 'Désinscrire'}
                        </button>
                        <button onClick={() => remove(s)}
                          style={{ padding: '5px 9px', borderRadius: 6, border: '1px solid #5A2B2B', background: 'transparent', color: '#C87A7A', fontSize: 10, cursor: 'pointer' }}>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ─── LIVRAISON TAB ─── */}
          {tab === 'livraison' && (() => {
            const s = siteContent.shipping;
            const opts: ShippingOption[] = s.options ?? [];
            const save = async () => {
              setContentSaving(x => ({ ...x, shipping: true }));
              await saveSiteConfigSection('shipping', siteContent.shipping);
              setContentSaving(x => ({ ...x, shipping: false }));
              setContentSaved(x => ({ ...x, shipping: true }));
              setTimeout(() => setContentSaved(x => ({ ...x, shipping: false })), 2500);
            };
            const addOpt = () => {
              const newOpt: ShippingOption = { id: `opt-${Date.now()}`, label: 'Nouvelle option', description: '', cost: 0, freeFrom: 0, active: true };
              setSiteContent(c => ({ ...c, shipping: { ...c.shipping, options: [...(c.shipping.options ?? []), newOpt] } }));
            };
            const updateOpt = (id: string, patch: Partial<ShippingOption>) => {
              setSiteContent(c => ({ ...c, shipping: { ...c.shipping, options: (c.shipping.options ?? []).map(o => o.id === id ? { ...o, ...patch } : o) } }));
            };
            const removeOpt = (id: string) => {
              setSiteContent(c => ({ ...c, shipping: { ...c.shipping, options: (c.shipping.options ?? []).filter(o => o.id !== id) } }));
            };
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: 700, color: TITLE, letterSpacing: '-0.02em' }}>Options de livraison</h1>
                  <p style={{ fontSize: '12px', color: TEXT3, marginTop: '4px' }}>Configurez les modes de livraison proposés au checkout. Le client choisira parmi les options actives.</p>
                </div>

                {/* Liste des options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {opts.map((opt, idx) => (
                    <div key={opt.id} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Header option */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: GOLD }}>Option #{idx + 1}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Toggle active */}
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: opt.active ? S_OK_T : TEXT3 }}>
                            <div
                              onClick={() => updateOpt(opt.id, { active: !opt.active })}
                              style={{ width: '34px', height: '18px', borderRadius: '99px', background: opt.active ? S_OK_BG : BORDER, position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                              <div style={{ position: 'absolute', top: '2px', left: opt.active ? '18px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: opt.active ? S_OK_T : TEXT3, transition: 'left 0.2s' }} />
                            </div>
                            {opt.active ? 'Active' : 'Inactive'}
                          </label>
                          {/* Delete */}
                          <button onClick={() => removeOpt(opt.id)} style={{ fontSize: '11px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px' }}>
                            Supprimer
                          </button>
                        </div>
                      </div>

                      {/* Fields */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2, fontWeight: 500 }}>Nom *</span>
                          <input value={opt.label} onChange={e => updateOpt(opt.id, { label: e.target.value })}
                            placeholder="ex: Livraison standard"
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '9px 12px', color: TEXT, fontSize: '13px', outline: 'none', width: '100%' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2, fontWeight: 500 }}>Description (délai, zone…)</span>
                          <input value={opt.description} onChange={e => updateOpt(opt.id, { description: e.target.value })}
                            placeholder="ex: 3-5 jours ouvrés"
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '9px 12px', color: TEXT, fontSize: '13px', outline: 'none', width: '100%' }} />
                        </label>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2, fontWeight: 500 }}>Coût (FCFA)</span>
                          <input type="number" min={0} value={opt.cost} onChange={e => updateOpt(opt.id, { cost: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '9px 12px', color: TEXT, fontSize: '13px', outline: 'none', width: '100%' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2, fontWeight: 500 }}>Gratuite dès (FCFA, 0 = jamais)</span>
                          <input type="number" min={0} value={opt.freeFrom} onChange={e => updateOpt(opt.id, { freeFrom: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '9px 12px', color: TEXT, fontSize: '13px', outline: 'none', width: '100%' }} />
                        </label>
                      </div>

                      {/* Aperçu rapide */}
                      <div style={{ fontSize: '11px', color: TEXT3, background: BG, borderRadius: '6px', padding: '8px 12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span>📦 <strong style={{ color: TEXT2 }}>{formatPrice(opt.cost)}</strong></span>
                        {opt.freeFrom > 0 && <span>🎁 Gratuite dès <strong style={{ color: S_OK_T }}>{formatPrice(opt.freeFrom)}</strong></span>}
                      </div>
                    </div>
                  ))}

                  <button onClick={addOpt}
                    style={{ border: `2px dashed ${BORDER}`, borderRadius: '12px', padding: '14px', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: GOLD, width: '100%' }}>
                    + Ajouter une option de livraison
                  </button>
                </div>

                {/* Message livraison gratuite global */}
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '560px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: TEXT }}>Message livraison gratuite (panier)</p>
                  <input value={s.freeShippingMessage} onChange={e => setSiteContent(c => ({ ...c, shipping: { ...c.shipping, freeShippingMessage: e.target.value } }))}
                    placeholder="ex: Livraison gratuite à partir de 25 000 FCFA"
                    style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 14px', color: TEXT, fontSize: '13px', outline: 'none' }} />
                  <span style={{ fontSize: '10px', color: TEXT3 }}>Affiché dans la barre de progression du panier.</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={save} disabled={contentSaving.shipping}
                    style={{ background: contentSaved.shipping ? S_SAVE_BG : GOLD2, color: contentSaved.shipping ? S_SAVE_T : BG, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    {contentSaved.shipping ? '✓ Sauvegardé' : contentSaving.shipping ? '…' : '💾 Sauvegarder'}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ─── CONTENU TAB ─── */}
          {tab === 'contenu' && (() => (
            <div className="space-y-6">
              <h1 className="text-lg font-bold" style={{ color: TEXT }}>Contenu du site</h1>
              <p className="text-xs" style={{ color: TEXT3 }}>Modifiez le contenu visible sur le frontend. Chaque section se sauvegarde indépendamment.</p>

              {contenutTopSectionsBlock}

              {/* ── Barre de confiance ── */}
              {trustItemsBlock}

              {/* ── Témoignages accueil ── */}
              {(() => {
                const save = async () => {
                  setContentSaving(s => ({ ...s, testimonials_home: true }));
                  await saveSiteConfigSection('testimonials_home', siteContent.testimonials_home);
                  setContentSaving(s => ({ ...s, testimonials_home: false }));
                  setContentSaved(s => ({ ...s, testimonials_home: true }));
                  setTimeout(() => setContentSaved(s => ({ ...s, testimonials_home: false })), 2500);
                };
                return (
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <p className="text-sm font-semibold" style={{ color: GOLD }}>💬 Témoignages (page d&apos;accueil)</p>
                    {siteContent.testimonials_home.map((t, i) => (
                      <div key={i} style={{ background: BG, borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <p className="text-xs font-semibold" style={{ color: TEXT2 }}>Témoignage {i + 1}</p>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="text-xs" style={{ color: TEXT3 }}>Nom</span>
                          <input value={t.name} onChange={e => setSiteContent(c => ({ ...c, testimonials_home: c.testimonials_home.map((x, j) => j === i ? { ...x, name: e.target.value } : x) }))}
                            style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '7px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="text-xs" style={{ color: TEXT3 }}>Texte</span>
                          <textarea value={t.text} rows={3} onChange={e => setSiteContent(c => ({ ...c, testimonials_home: c.testimonials_home.map((x, j) => j === i ? { ...x, text: e.target.value } : x) }))}
                            style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '7px 10px', color: TEXT, fontSize: '12px', resize: 'vertical', outline: 'none' }} />
                        </label>
                        <ImageUpload
                          value={t.avatar}
                          onChange={url => setSiteContent(c => ({ ...c, testimonials_home: c.testimonials_home.map((x, j) => j === i ? { ...x, avatar: url } : x) }))}
                          folder="avatars"
                          label="Photo du client"
                          previewSize={80}
                        />
                      </div>
                    ))}
                    <button onClick={save} disabled={contentSaving.testimonials_home}
                      style={{ alignSelf: 'flex-end', background: contentSaved.testimonials_home ? S_SAVE_BG : GOLD2, color: contentSaved.testimonials_home ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      {contentSaved.testimonials_home ? '✓ Sauvegardé' : contentSaving.testimonials_home ? '…' : '💾 Sauvegarder'}
                    </button>
                  </div>
                );
              })()}

              {/* ── Héros pages catégories ── */}
              {([
                { key: 'hero_face' as const,   label: '🧴 Hero — Visage',  fields: ['eyebrow','title','titleAccent','lead','image'] as const },
                { key: 'hero_body' as const,   label: '💆 Hero — Corps',   fields: ['eyebrow','title','titleAccent','lead','image'] as const },
                { key: 'hero_gammes' as const, label: '✨ Hero — Gammes',  fields: ['eyebrow','title','titleAccent','lead','image'] as const },
                { key: 'hero_kits' as const,   label: '🎁 Hero — Kits',   fields: ['eyebrow','title','titleAccent','lead','image','stat1Num','stat1Label','stat2Num','stat2Label','stat3Num','stat3Label'] as const },
                { key: 'hero_duo' as const,    label: '👥 Hero — Duo',    fields: ['eyebrow','title','titleAccent','lead','image','synergyNum','synergyText'] as const },
                { key: 'hero_quiz' as const,   label: '📋 Hero — Quiz Teint', fields: ['eyebrow','title','titleAccent','lead','image','floaterLabel','floaterText'] as const },
              ] as const).map(({ key, label, fields }) => {
                const fieldLabels: Record<string, string> = {
                  eyebrow: 'Accroche (texte au-dessus du titre)',
                  title: 'Titre principal',
                  titleAccent: 'Titre — partie accentuée (dorée)',
                  lead: 'Description / sous-titre',
                  image: 'Image (chemin ex: /categories/visage.png)',
                  stat1Num: 'Stat 1 — chiffre',
                  stat1Label: 'Stat 1 — label',
                  stat2Num: 'Stat 2 — chiffre',
                  stat2Label: 'Stat 2 — label',
                  stat3Num: 'Stat 3 — chiffre',
                  stat3Label: 'Stat 3 — label',
                  synergyNum: 'Synergy — nombre (ex: 1 + 1)',
                  synergyText: 'Synergy — résultat (ex: résultats en 14 jours)',
                  floaterLabel: 'Floater — label',
                  floaterText: 'Floater — texte citation',
                };
                const save = async () => {
                  setContentSaving(s => ({ ...s, [key]: true }));
                  await saveSiteConfigSection(key, siteContent[key] as SiteConfig[typeof key]);
                  setContentSaving(s => ({ ...s, [key]: false }));
                  setContentSaved(s => ({ ...s, [key]: true }));
                  setTimeout(() => setContentSaved(s => ({ ...s, [key]: false })), 2500);
                };
                const f = siteContent[key] as Record<string, string>;
                return (
                  <div key={key} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p className="text-sm font-semibold" style={{ color: GOLD }}>{label}</p>
                    {(fields as readonly string[]).filter(f2 => f2 !== 'image').map(field => (
                      <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className="text-xs" style={{ color: TEXT2 }}>{fieldLabels[field] ?? field}</span>
                        {field === 'lead' || field === 'floaterText' ? (
                          <textarea
                            rows={3}
                            value={f[field] ?? ''}
                            onChange={e => setSiteContent(c => ({ ...c, [key]: { ...c[key], [field]: e.target.value } }))}
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', resize: 'vertical', outline: 'none' }}
                          />
                        ) : (
                          <input
                            value={f[field] ?? ''}
                            onChange={e => setSiteContent(c => ({ ...c, [key]: { ...c[key], [field]: e.target.value } }))}
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }}
                          />
                        )}
                      </label>
                    ))}
                    <ImageUpload
                      value={f.image ?? ''}
                      onChange={url => setSiteContent(c => ({ ...c, [key]: { ...c[key], image: url } }))}
                      folder="categories"
                      label="Image du hero"
                      previewSize={140}
                    />
                    <button onClick={save} disabled={contentSaving[key]}
                      style={{ alignSelf: 'flex-end', background: contentSaved[key] ? S_SAVE_BG : GOLD2, color: contentSaved[key] ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      {contentSaved[key] ? '✓ Sauvegardé' : contentSaving[key] ? '…' : '💾 Sauvegarder'}
                    </button>
                  </div>
                );
              })}

              {/* ── Frais de livraison ── */}
              {(() => {
                const save = async () => {
                  setContentSaving(s => ({ ...s, shipping: true }));
                  await saveSiteConfigSection('shipping', siteContent.shipping);
                  setContentSaving(s => ({ ...s, shipping: false }));
                  setContentSaved(s => ({ ...s, shipping: true }));
                  setTimeout(() => setContentSaved(s => ({ ...s, shipping: false })), 2500);
                };
              })()}


              {/* ── Codes promo ── */}
              {(() => {
                const codes = siteContent.promo_codes;
                const setCodes = (next: PromoCode[]) => setSiteContent(c => ({ ...c, promo_codes: next }));
                const addCode = () => setCodes([...codes, { code: '', type: 'percent', value: 10, minSubtotal: 0, active: true, expiresAt: '' }]);
                const updateCode = (i: number, patch: Partial<PromoCode>) =>
                  setCodes(codes.map((c, j) => j === i ? { ...c, ...patch } : c));
                const removeCode = (i: number) => setCodes(codes.filter((_, j) => j !== i));
                const save = async () => {
                  // Normalisation : code en majuscules, trim
                  const normalized = codes.map(c => ({ ...c, code: c.code.trim().toUpperCase() }));
                  setCodes(normalized);
                  setContentSaving(s => ({ ...s, promo_codes: true }));
                  await saveSiteConfigSection('promo_codes', normalized);
                  setContentSaving(s => ({ ...s, promo_codes: false }));
                  setContentSaved(s => ({ ...s, promo_codes: true }));
                  setTimeout(() => setContentSaved(s => ({ ...s, promo_codes: false })), 2500);
                };
                return (
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p className="text-sm font-semibold" style={{ color: GOLD }}>🎟️ Codes promo</p>
                      <button onClick={addCode}
                        style={{ background: SURFACE2, color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                        + Nouveau code
                      </button>
                    </div>
                    {codes.length === 0 && (
                      <p className="text-xs" style={{ color: TEXT3 }}>Aucun code promo. Cliquez sur « + Nouveau code » pour en créer un.</p>
                    )}
                    {codes.map((c, i) => (
                      <div key={i} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span className="text-xs" style={{ color: TEXT2 }}>Code</span>
                            <input value={c.code} onChange={e => updateCode(i, { code: e.target.value.toUpperCase() })}
                              placeholder="BIENVENUE10"
                              style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', outline: 'none' }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span className="text-xs" style={{ color: TEXT2 }}>Type</span>
                            <select value={c.type} onChange={e => updateCode(i, { type: e.target.value as PromoCode['type'] })}
                              style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }}>
                              <option value="percent">% (pourcent)</option>
                              <option value="fixed">FCFA (fixe)</option>
                            </select>
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span className="text-xs" style={{ color: TEXT2 }}>Valeur</span>
                            <input type="number" min={0} value={c.value}
                              onChange={e => updateCode(i, { value: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                              style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span className="text-xs" style={{ color: TEXT2 }}>Min. panier (FCFA)</span>
                            <input type="number" min={0} value={c.minSubtotal ?? 0}
                              onChange={e => updateCode(i, { minSubtotal: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                              style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span className="text-xs" style={{ color: TEXT2 }}>Expiration</span>
                            <input type="date" value={c.expiresAt ?? ''}
                              onChange={e => updateCode(i, { expiresAt: e.target.value })}
                              style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                          </label>
                          <button onClick={() => removeCode(i)}
                            style={{ background: 'transparent', color: S_ERR_T, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', fontSize: '11px', cursor: 'pointer', height: '34px' }}>
                            🗑
                          </button>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: TEXT2, cursor: 'pointer' }}>
                          <input type="checkbox" checked={c.active} onChange={e => updateCode(i, { active: e.target.checked })} />
                          <span>Actif</span>
                          <span style={{ marginLeft: '12px', color: TEXT3, fontSize: '11px' }}>
                            Aperçu : {c.type === 'percent' ? `−${c.value}% sur le panier` : `−${c.value.toLocaleString('fr-FR')} FCFA`}
                            {c.minSubtotal ? ` (min ${c.minSubtotal.toLocaleString('fr-FR')} FCFA)` : ''}
                          </span>
                        </label>
                      </div>
                    ))}
                    <button onClick={save} disabled={contentSaving.promo_codes}
                      style={{ alignSelf: 'flex-end', background: contentSaved.promo_codes ? S_SAVE_BG : GOLD2, color: contentSaved.promo_codes ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      {contentSaved.promo_codes ? '✓ Sauvegardé' : contentSaving.promo_codes ? '…' : '💾 Sauvegarder'}
                    </button>
                  </div>
                );
              })()}

              {/* ─── FAQ ─── */}
              {(() => {
                const faq = siteContent.faq;
                const setFaq = (next: typeof faq) => setSiteContent(c => ({ ...c, faq: next }));
                const save = async () => {
                  setContentSaving(s => ({ ...s, faq: true }));
                  await saveSiteConfigSection('faq', faq);
                  setContentSaving(s => ({ ...s, faq: false }));
                  setContentSaved(s => ({ ...s, faq: true }));
                  setTimeout(() => setContentSaved(s => ({ ...s, faq: false })), 2500);
                };
                const addCat = () => setFaq([...faq, { cat: 'Nouvelle catégorie', items: [] }]);
                const removeCat = (ci: number) => setFaq(faq.filter((_, i) => i !== ci));
                const updateCatTitle = (ci: number, title: string) =>
                  setFaq(faq.map((c, i) => i === ci ? { ...c, cat: title } : c));
                const addItem = (ci: number) =>
                  setFaq(faq.map((c, i) => i === ci ? { ...c, items: [...c.items, { q: '', a: '' }] } : c));
                const removeItem = (ci: number, qi: number) =>
                  setFaq(faq.map((c, i) => i === ci ? { ...c, items: c.items.filter((_, j) => j !== qi) } : c));
                const updateItem = (ci: number, qi: number, patch: { q?: string; a?: string }) =>
                  setFaq(faq.map((c, i) => i === ci ? { ...c, items: c.items.map((it, j) => j === qi ? { ...it, ...patch } : it) } : c));
                return (
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ color: TEXT, fontSize: '14px', fontWeight: 700 }}>FAQ</h3>
                      <button onClick={addCat} style={{ background: 'transparent', color: GOLD, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '6px 12px', fontSize: '11px', cursor: 'pointer' }}>+ Catégorie</button>
                    </div>
                    {faq.length === 0 && <p style={{ fontSize: '12px', color: TEXT3 }}>Aucune catégorie. Ajoutez-en une.</p>}
                    {faq.map((cat, ci) => (
                      <div key={ci} style={{ background: SURFACE2, border: `1px solid ${BORDER2}`, borderRadius: '6px', padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                          <input value={cat.cat} onChange={e => updateCatTitle(ci, e.target.value)}
                            style={{ flex: 1, background: SURFACE, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '7px 10px', fontSize: '12px', fontWeight: 600 }} />
                          <button onClick={() => addItem(ci)} style={{ background: 'transparent', color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '6px 10px', fontSize: '11px', cursor: 'pointer' }}>+ Q/R</button>
                          <button onClick={() => removeCat(ci)} style={{ background: 'transparent', color: S_ERR_T, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '6px 10px', fontSize: '11px', cursor: 'pointer' }}>🗑</button>
                        </div>
                        {cat.items.map((it, qi) => (
                          <div key={qi} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', borderTop: `1px solid ${BORDER2}` }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <input placeholder="Question" value={it.q} onChange={e => updateItem(ci, qi, { q: e.target.value })}
                                style={{ flex: 1, background: SURFACE, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '6px 9px', fontSize: '12px' }} />
                              <button onClick={() => removeItem(ci, qi)} style={{ background: 'transparent', color: S_ERR_T, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>×</button>
                            </div>
                            <textarea placeholder="Réponse" value={it.a} onChange={e => updateItem(ci, qi, { a: e.target.value })} rows={3}
                              style={{ width: '100%', background: SURFACE, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '6px 9px', fontSize: '12px', resize: 'vertical', fontFamily: 'inherit' }} />
                          </div>
                        ))}
                      </div>
                    ))}
                    <button onClick={save} disabled={contentSaving.faq}
                      style={{ alignSelf: 'flex-end', background: contentSaved.faq ? S_SAVE_BG : GOLD2, color: contentSaved.faq ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      {contentSaved.faq ? '✓ Sauvegardé' : contentSaving.faq ? '…' : '💾 Sauvegarder'}
                    </button>
                  </div>
                );
              })()}

              {/* ─── Newsletter (configuration affichage) ─── */}
              {(() => {
                const n = siteContent.newsletter;
                const update = (patch: Partial<typeof n>) => setSiteContent(c => ({ ...c, newsletter: { ...c.newsletter, ...patch } }));
                const save = async () => {
                  setContentSaving(s => ({ ...s, newsletter: true }));
                  await saveSiteConfigSection('newsletter', n);
                  setContentSaving(s => ({ ...s, newsletter: false }));
                  setContentSaved(s => ({ ...s, newsletter: true }));
                  setTimeout(() => setContentSaved(s => ({ ...s, newsletter: false })), 2500);
                };
                return (
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{ color: TEXT, fontSize: '14px', fontWeight: 700 }}>Newsletter — Affichage</h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: TEXT2 }}>
                      <input type="checkbox" checked={n.enabled} onChange={e => update({ enabled: e.target.checked })} />
                      Afficher le bloc newsletter
                    </label>
                    {(['title', 'subtitle', 'ctaLabel', 'successMessage'] as const).map(k => (
                      <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</span>
                        <input value={n[k]} onChange={e => update({ [k]: e.target.value } as Partial<typeof n>)}
                          style={{ background: SURFACE2, color: TEXT, border: `1px solid ${BORDER2}`, borderRadius: '4px', padding: '7px 10px', fontSize: '12px' }} />
                      </div>
                    ))}
                    <button onClick={save} disabled={contentSaving.newsletter}
                      style={{ alignSelf: 'flex-end', background: contentSaved.newsletter ? S_SAVE_BG : GOLD2, color: contentSaved.newsletter ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      {contentSaved.newsletter ? '✓ Sauvegardé' : contentSaving.newsletter ? '…' : '💾 Sauvegarder'}
                    </button>
                  </div>
                );
              })()}

              {/* ─── Pages légales (CGV, Confidentialité, Engagements, Contact) ─── */}
              {(() => {
                const KEYS = [
                  { key: 'legal_cgv' as const, label: 'CGV', slug: 'cgv' },
                  { key: 'legal_confidentialite' as const, label: 'Confidentialité', slug: 'confidentialite' },
                  { key: 'legal_engagements' as const, label: 'Engagements', slug: 'engagements' },
                  { key: 'legal_contact' as const, label: 'Contact', slug: 'contact' },
                ];
                return (
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h3 style={{ color: TEXT, fontSize: '14px', fontWeight: 700 }}>Pages légales</h3>
                    <p style={{ color: TEXT3, fontSize: '11px' }}>
                      Édite l&apos;eyebrow, le titre, l&apos;intro, la date de mise à jour et un éventuel bloc HTML. Si tu laisses bodyHtml vide, la page conserve son contenu rédactionnel par défaut.
                    </p>
                    {KEYS.map(({ key, label, slug }) => {
                      const lp = siteContent[key];
                      const update = (patch: Partial<typeof lp>) => setSiteContent(c => ({ ...c, [key]: { ...c[key], ...patch } }));
                      const save = async () => {
                        setContentSaving(s => ({ ...s, [key]: true }));
                        await saveSiteConfigSection(key, lp);
                        setContentSaving(s => ({ ...s, [key]: false }));
                        setContentSaved(s => ({ ...s, [key]: true }));
                        setTimeout(() => setContentSaved(s => ({ ...s, [key]: false })), 2500);
                      };
                      return (
                        <details key={key} style={{ border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '10px 12px', background: SURFACE2 }}>
                          <summary style={{ cursor: 'pointer', color: GOLD, fontSize: '12px', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <span>{label}</span>
                            <a href={`/${slug}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              style={{ fontSize: '10px', color: TEXT3, textDecoration: 'none', border: `1px solid ${BORDER2}`, padding: '2px 8px', borderRadius: '4px' }}>
                              Aperçu ↗
                            </a>
                          </summary>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                            {(['eyebrow', 'title', 'lead', 'updatedAt'] as const).map(k => (
                              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</span>
                                <input value={lp[k] ?? ''} onChange={e => update({ [k]: e.target.value } as Partial<typeof lp>)}
                                  style={{ background: SURFACE, color: TEXT, border: `1px solid ${BORDER2}`, borderRadius: '4px', padding: '7px 10px', fontSize: '12px' }} />
                              </div>
                            ))}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>bodyHtml (optionnel — remplace le corps)</span>
                              <textarea value={lp.bodyHtml ?? ''} onChange={e => update({ bodyHtml: e.target.value })} rows={6}
                                style={{ background: SURFACE, color: TEXT, border: `1px solid ${BORDER2}`, borderRadius: '4px', padding: '7px 10px', fontSize: '11px', fontFamily: 'monospace', resize: 'vertical' }} />
                            </div>
                            <button onClick={save} disabled={contentSaving[key]}
                              style={{ alignSelf: 'flex-end', background: contentSaved[key] ? S_SAVE_BG : GOLD2, color: contentSaved[key] ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                              {contentSaved[key] ? '✓ Sauvegardé' : contentSaving[key] ? '…' : '💾 Sauvegarder'}
                            </button>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                );
              })()}

              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '14px' }}>
                <p className="text-xs" style={{ color: TEXT3 }}>
                  <span style={{ color: GOLD }}>ℹ️</span>{' '}
                  Les modifications sont sauvegardées dans Supabase (table <code style={{ color: TEXT2 }}>site_config</code>).
                  Assurez-vous que la table existe :{' '}
                  <code style={{ color: TEXT2, fontSize: '10px' }}>CREATE TABLE site_config (key TEXT PRIMARY KEY, value JSONB, updated_at TIMESTAMPTZ DEFAULT NOW());</code>
                </p>
              </div>
            </div>
          ))()}

          {/* ─── MARKETING TAB ─── */}
          {tab === 'marketing' && (() => {
            const mkt: MarketingConfig = siteContent.marketing ?? { banners: [], welcomePopup: { enabled: false, title: '', subtitle: '', delaySeconds: 5, bgColor: '#1C1610', ctaLabel: "Profiter de l'offre" }, upsellRules: [] };

            const saveMkt = async () => {
              setContentSaving(x => ({ ...x, marketing: true }));
              await saveSiteConfigSection('marketing', mkt);
              setContentSaving(x => ({ ...x, marketing: false }));
              setContentSaved(x => ({ ...x, marketing: true }));
              setTimeout(() => setContentSaved(x => ({ ...x, marketing: false })), 2500);
            };

            const updateMkt = (patch: Partial<MarketingConfig>) =>
              setSiteContent(c => ({ ...c, marketing: { ...c.marketing, ...patch } }));

            // Bannières
            const addBanner = () => {
              const b: PromoBanner = { id: `bn-${Date.now()}`, text: 'Nouvelle bannière', bgColor: '#1C1610', textColor: '#D4A25A', active: false };
              updateMkt({ banners: [...(mkt.banners ?? []), b] });
            };
            const updBanner = (id: string, patch: Partial<PromoBanner>) =>
              updateMkt({ banners: (mkt.banners ?? []).map(b => b.id === id ? { ...b, ...patch } : b) });
            const delBanner = (id: string) =>
              updateMkt({ banners: (mkt.banners ?? []).filter(b => b.id !== id) });

            // Codes promo
            const promos: PromoCode[] = siteContent.promo_codes ?? [];
            const savePromos = async () => {
              setContentSaving(x => ({ ...x, promo_codes: true }));
              await saveSiteConfigSection('promo_codes', siteContent.promo_codes);
              setContentSaving(x => ({ ...x, promo_codes: false }));
              setContentSaved(x => ({ ...x, promo_codes: true }));
              setTimeout(() => setContentSaved(x => ({ ...x, promo_codes: false })), 2500);
            };
            const addPromo = () => setSiteContent(c => ({ ...c, promo_codes: [...(c.promo_codes ?? []), { code: '', type: 'percent', value: 10, active: true }] }));
            const updPromo = (i: number, patch: Partial<PromoCode>) => setSiteContent(c => ({ ...c, promo_codes: (c.promo_codes ?? []).map((p, j) => j === i ? { ...p, ...patch } : p) }));
            const delPromo = (i: number) => setSiteContent(c => ({ ...c, promo_codes: (c.promo_codes ?? []).filter((_, j) => j !== i) }));

            // Upsell
            const addUpsell = () => {
              const u: UpsellRule = { id: `up-${Date.now()}`, triggerProductIds: [], suggestedProductIds: [], label: 'Complétez votre routine', active: true };
              updateMkt({ upsellRules: [...(mkt.upsellRules ?? []), u] });
            };
            const updUpsell = (id: string, patch: Partial<UpsellRule>) =>
              updateMkt({ upsellRules: (mkt.upsellRules ?? []).map(u => u.id === id ? { ...u, ...patch } : u) });
            const delUpsell = (id: string) =>
              updateMkt({ upsellRules: (mkt.upsellRules ?? []).filter(u => u.id !== id) });

            const SUB_TABS = [
              { id: 'banners' as const,  label: '📢 Bannières' },
              { id: 'popup' as const,    label: '🎁 Pop-up Bienvenue' },
              { id: 'promos' as const,   label: '🏷 Codes Promo' },
              { id: 'upsell' as const,   label: '⬆ Upsell' },
              { id: 'tracking' as const, label: '📊 Tracking' },
            ];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header */}
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: 700, color: TITLE, letterSpacing: '-0.02em' }}>📣 Marketing</h1>
                  <p style={{ fontSize: '12px', color: TEXT3, marginTop: '4px' }}>Bannières, pop-ups, codes promo et règles de vente additionnelle.</p>
                </div>

                {/* Sub-tabs */}
                <div style={{ display: 'flex', gap: '4px', background: SURFACE, borderRadius: '10px', padding: '4px', border: `1px solid ${BORDER}`, width: 'fit-content' }}>
                  {SUB_TABS.map(st => (
                    <button key={st.id} onClick={() => setMktSubTab(st.id)}
                      style={{ padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: mktSubTab === st.id ? 700 : 400, cursor: 'pointer', border: 'none', background: mktSubTab === st.id ? GOLD2 : 'transparent', color: mktSubTab === st.id ? BG : TEXT2, transition: 'all .15s' }}>
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* ── Bannières ── */}
                {mktSubTab === 'banners' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ fontSize: '12px', color: TEXT3 }}>Les bannières actives s&apos;affichent en top-bar sur le site. Seule la première active sera visible.</p>
                    {(mkt.banners ?? []).map((b, idx) => (
                      <div key={b.id} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: GOLD }}>Bannière #{idx + 1}</span>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: b.active ? S_OK_T : TEXT3 }}>
                              <div onClick={() => updBanner(b.id, { active: !b.active })}
                                style={{ width: '34px', height: '18px', borderRadius: '99px', background: b.active ? S_OK_BG : BORDER, position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                                <div style={{ position: 'absolute', top: '2px', left: b.active ? '18px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: b.active ? S_OK_T : TEXT3, transition: 'left 0.2s' }} />
                              </div>
                              {b.active ? 'Active' : 'Inactive'}
                            </label>
                            <button onClick={() => delBanner(b.id)} style={{ fontSize: '11px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>Supprimer</button>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: '10px' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Texte *</span>
                            <input value={b.text} onChange={e => updBanner(b.id, { text: e.target.value })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Emoji</span>
                            <input value={b.emoji ?? ''} onChange={e => updBanner(b.id, { emoji: e.target.value })}
                              placeholder="🚚"
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '16px', outline: 'none', textAlign: 'center' }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Lien (optionnel)</span>
                            <input value={b.link ?? ''} onChange={e => updBanner(b.id, { link: e.target.value })}
                              placeholder="/boutique"
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                          </label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Fond (hex)</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" value={b.bgColor} onChange={e => updBanner(b.id, { bgColor: e.target.value })} style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'none', cursor: 'pointer' }} />
                              <input value={b.bgColor} onChange={e => updBanner(b.id, { bgColor: e.target.value })}
                                style={{ flex: 1, background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                            </div>
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Texte (hex)</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" value={b.textColor} onChange={e => updBanner(b.id, { textColor: e.target.value })} style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', background: 'none', cursor: 'pointer' }} />
                              <input value={b.textColor} onChange={e => updBanner(b.id, { textColor: e.target.value })}
                                style={{ flex: 1, background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                            </div>
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Début (optionnel)</span>
                            <input type="date" value={b.startsAt ?? ''} onChange={e => updBanner(b.id, { startsAt: e.target.value })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Fin (optionnel)</span>
                            <input type="date" value={b.endsAt ?? ''} onChange={e => updBanner(b.id, { endsAt: e.target.value })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                          </label>
                        </div>
                        {/* Preview */}
                        <div style={{ borderRadius: '6px', padding: '10px 16px', background: b.bgColor, color: b.textColor, fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
                          {b.emoji && <span style={{ marginRight: '6px' }}>{b.emoji}</span>}{b.text}
                        </div>
                      </div>
                    ))}
                    <button onClick={addBanner}
                      style={{ border: `2px dashed ${BORDER}`, borderRadius: '12px', padding: '14px', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: GOLD, width: '100%' }}>
                      + Ajouter une bannière
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={saveMkt} disabled={contentSaving.marketing}
                        style={{ background: contentSaved.marketing ? S_SAVE_BG : GOLD2, color: contentSaved.marketing ? S_SAVE_T : BG, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        {contentSaved.marketing ? '✓ Sauvegardé' : contentSaving.marketing ? '…' : '💾 Sauvegarder'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Pop-up Bienvenue ── */}
                {mktSubTab === 'popup' && (() => {
                  const p = mkt.welcomePopup;
                  const updPopup = (patch: Partial<WelcomePopup>) =>
                    updateMkt({ welcomePopup: { ...mkt.welcomePopup, ...patch } });
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
                      <p style={{ fontSize: '12px', color: TEXT3 }}>Affiché une seule fois au visiteur (flag localStorage) après le délai configuré. Utilisez un code promo existant pour inciter à l&apos;achat.</p>
                      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Toggle */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                          <div onClick={() => updPopup({ enabled: !p.enabled })}
                            style={{ width: '40px', height: '22px', borderRadius: '99px', background: p.enabled ? S_OK_BG : BORDER, position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', top: '3px', left: p.enabled ? '20px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: p.enabled ? S_OK_T : TEXT3, transition: 'left 0.2s' }} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: p.enabled ? S_OK_T : TEXT2 }}>{p.enabled ? 'Pop-up activé' : 'Pop-up désactivé'}</span>
                        </label>

                        {([
                          ['title', 'Titre', 'Bienvenue chez SD Cosmétique'],
                          ['subtitle', 'Sous-titre', 'Bénéficiez de 10% sur votre première commande'],
                          ['discountCode', 'Code promo à afficher (optionnel)', 'BIENVENUE10'],
                          ['ctaLabel', 'Label du bouton CTA', "Profiter de l'offre"],
                        ] as [keyof WelcomePopup, string, string][]).map(([key, label, ph]) => (
                          <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>{label}</span>
                            <input value={(p[key] as string) ?? ''} placeholder={ph}
                              onChange={e => updPopup({ [key]: e.target.value })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '9px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
                          </label>
                        ))}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Délai d&apos;affichage (secondes)</span>
                            <input type="number" min={0} max={60} value={p.delaySeconds}
                              onChange={e => updPopup({ delaySeconds: Math.max(0, parseInt(e.target.value) || 0) })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '9px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Couleur fond (hex)</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input type="color" value={p.bgColor} onChange={e => updPopup({ bgColor: e.target.value })} style={{ width: '36px', height: '36px', borderRadius: '6px', border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }} />
                              <input value={p.bgColor} onChange={e => updPopup({ bgColor: e.target.value })}
                                style={{ flex: 1, background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '9px 12px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                            </div>
                          </label>
                        </div>

                        {/* Aperçu */}
                        <div style={{ borderRadius: '12px', padding: '28px 24px', background: p.bgColor, border: `1px solid ${BORDER2}`, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: GOLD }}>{p.title || '…'}</div>
                          <div style={{ fontSize: '12px', color: TEXT2 }}>{p.subtitle || '…'}</div>
                          {p.discountCode && <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.14em', color: GOLD, background: 'rgba(200,151,74,0.12)', padding: '8px 16px', borderRadius: '8px', border: `1px dashed ${GOLD}` }}>{p.discountCode}</div>}
                          <button style={{ background: GOLD2, color: BG, border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}>{p.ctaLabel || '…'}</button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={saveMkt} disabled={contentSaving.marketing}
                          style={{ background: contentSaved.marketing ? S_SAVE_BG : GOLD2, color: contentSaved.marketing ? S_SAVE_T : BG, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                          {contentSaved.marketing ? '✓ Sauvegardé' : contentSaving.marketing ? '…' : '💾 Sauvegarder'}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* ── Codes Promo ── */}
                {mktSubTab === 'promos' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p style={{ fontSize: '12px', color: TEXT3 }}>Les codes s&apos;appliquent au checkout. Le client saisit le code et la réduction est calculée en temps réel.</p>
                    {promos.map((pc, i) => (
                      <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: GOLD, letterSpacing: '0.08em' }}>{pc.code || `Code #${i + 1}`}</span>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: pc.active ? S_OK_T : TEXT3 }}>
                              <div onClick={() => updPromo(i, { active: !pc.active })}
                                style={{ width: '34px', height: '18px', borderRadius: '99px', background: pc.active ? S_OK_BG : BORDER, position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                                <div style={{ position: 'absolute', top: '2px', left: pc.active ? '18px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: pc.active ? S_OK_T : TEXT3, transition: 'left 0.2s' }} />
                              </div>
                              {pc.active ? 'Actif' : 'Inactif'}
                            </label>
                            <button onClick={() => delPromo(i)} style={{ fontSize: '11px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>Supprimer</button>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Code *</span>
                            <input value={pc.code} onChange={e => updPromo(i, { code: e.target.value.toUpperCase() })}
                              placeholder="PROMO20"
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: GOLD, fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', outline: 'none', textTransform: 'uppercase' as const }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Type</span>
                            <select value={pc.type} onChange={e => updPromo(i, { type: e.target.value as 'percent' | 'fixed' })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                              <option value="percent">Pourcentage (%)</option>
                              <option value="fixed">Montant fixe (FCFA)</option>
                            </select>
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Valeur {pc.type === 'percent' ? '(%)' : '(FCFA)'}</span>
                            <input type="number" min={0} value={pc.value} onChange={e => updPromo(i, { value: parseFloat(e.target.value) || 0 })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: TEXT2 }}>Min. panier (FCFA, 0=∅)</span>
                            <input type="number" min={0} value={pc.minSubtotal ?? 0} onChange={e => updPromo(i, { minSubtotal: parseInt(e.target.value) || 0 })}
                              style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
                          </label>
                        </div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2 }}>Expiration (optionnel)</span>
                          <input type="date" value={pc.expiresAt ?? ''} onChange={e => updPromo(i, { expiresAt: e.target.value || undefined })}
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                        </label>
                      </div>
                    ))}
                    <button onClick={addPromo}
                      style={{ border: `2px dashed ${BORDER}`, borderRadius: '12px', padding: '14px', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: GOLD, width: '100%' }}>
                      + Ajouter un code promo
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={savePromos} disabled={contentSaving.promo_codes}
                        style={{ background: contentSaved.promo_codes ? S_SAVE_BG : GOLD2, color: contentSaved.promo_codes ? S_SAVE_T : BG, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        {contentSaved.promo_codes ? '✓ Sauvegardé' : contentSaving.promo_codes ? '…' : '💾 Sauvegarder'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Upsell ── */}
                {mktSubTab === 'upsell' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p style={{ fontSize: '12px', color: TEXT3 }}>Définissez des règles de suggestion produit. Quand un produit déclencheur est dans le panier, les produits suggérés s&apos;affichent.</p>
                    {(mkt.upsellRules ?? []).map((u, idx) => (
                      <div key={u.id} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: GOLD }}>Règle #{idx + 1}</span>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', color: u.active ? S_OK_T : TEXT3 }}>
                              <div onClick={() => updUpsell(u.id, { active: !u.active })}
                                style={{ width: '34px', height: '18px', borderRadius: '99px', background: u.active ? S_OK_BG : BORDER, position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                                <div style={{ position: 'absolute', top: '2px', left: u.active ? '18px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: u.active ? S_OK_T : TEXT3, transition: 'left 0.2s' }} />
                              </div>
                              {u.active ? 'Active' : 'Inactive'}
                            </label>
                            <button onClick={() => delUpsell(u.id)} style={{ fontSize: '11px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>Supprimer</button>
                          </div>
                        </div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2 }}>Label affiché au client</span>
                          <input value={u.label} onChange={e => updUpsell(u.id, { label: e.target.value })}
                            placeholder="Complétez votre routine"
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2 }}>IDs produits déclencheurs (séparés par virgule)</span>
                          <input value={u.triggerProductIds.join(',')} onChange={e => updUpsell(u.id, { triggerProductIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            placeholder="prod-001,prod-002"
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', fontFamily: 'monospace' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: TEXT2 }}>IDs produits suggérés (séparés par virgule)</span>
                          <input value={u.suggestedProductIds.join(',')} onChange={e => updUpsell(u.id, { suggestedProductIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            placeholder="prod-010,prod-011"
                            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', fontFamily: 'monospace' }} />
                        </label>
                      </div>
                    ))}
                    <button onClick={addUpsell}
                      style={{ border: `2px dashed ${BORDER}`, borderRadius: '12px', padding: '14px', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: GOLD, width: '100%' }}>
                      + Ajouter une règle upsell
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={saveMkt} disabled={contentSaving.marketing}
                        style={{ background: contentSaved.marketing ? S_SAVE_BG : GOLD2, color: contentSaved.marketing ? S_SAVE_T : BG, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        {contentSaved.marketing ? '✓ Sauvegardé' : contentSaving.marketing ? '…' : '💾 Sauvegarder'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Tracking ── */}
                {mktSubTab === 'tracking' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '12px', color: TEXT3 }}>Renseignez vos identifiants de suivi. Les scripts sont injectés automatiquement dans le <code style={{ background: SURFACE2, padding: '1px 5px', borderRadius: '4px', fontSize: '11px' }}>&lt;head&gt;</code> de toutes les pages.</p>

                    {/* Facebook Pixel */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>📘</span>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: TEXT, margin: 0 }}>Facebook / Meta Pixel</p>
                          <p style={{ fontSize: '11px', color: TEXT3, margin: 0 }}>Gestionnaire d'événements Meta → Pixels → Votre Pixel → ID</p>
                        </div>
                      </div>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: TEXT2 }}>Pixel ID</span>
                        <input
                          value={mkt.facebookPixelId ?? ''}
                          onChange={e => updateMkt({ facebookPixelId: e.target.value })}
                          placeholder="ex : 123456789012345"
                          style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', fontFamily: 'monospace' }}
                        />
                      </label>
                    </div>

                    {/* Google Ads */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>🟡</span>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: TEXT, margin: 0 }}>Google Ads (gTag)</p>
                          <p style={{ fontSize: '11px', color: TEXT3, margin: 0 }}>Google Ads → Outils → Balises → ID de conversion (format AW-XXXXXXXXX)</p>
                        </div>
                      </div>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: TEXT2 }}>ID de conversion</span>
                        <input
                          value={mkt.googleAdsId ?? ''}
                          onChange={e => updateMkt({ googleAdsId: e.target.value })}
                          placeholder="ex : AW-123456789"
                          style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', fontFamily: 'monospace' }}
                        />
                      </label>
                    </div>

                    {/* Google Tag Manager */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>🏷</span>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: TEXT, margin: 0 }}>Google Tag Manager</p>
                          <p style={{ fontSize: '11px', color: TEXT3, margin: 0 }}>GTM → Admin → Votre conteneur → ID du conteneur (format GTM-XXXXXXX)</p>
                        </div>
                      </div>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: TEXT2 }}>Container ID</span>
                        <input
                          value={mkt.googleTagManagerId ?? ''}
                          onChange={e => updateMkt({ googleTagManagerId: e.target.value })}
                          placeholder="ex : GTM-ABCDE12"
                          style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', fontFamily: 'monospace' }}
                        />
                      </label>
                    </div>

                    {/* TikTok Pixel */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>🎵</span>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: TEXT, margin: 0 }}>TikTok Pixel</p>
                          <p style={{ fontSize: '11px', color: TEXT3, margin: 0 }}>TikTok Ads Manager → Assets → Events → Web Events → Pixel ID</p>
                        </div>
                      </div>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: TEXT2 }}>Pixel ID</span>
                        <input
                          value={mkt.tiktokPixelId ?? ''}
                          onChange={e => updateMkt({ tiktokPixelId: e.target.value })}
                          placeholder="ex : CXXXXXXXXXXXXXXX"
                          style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '12px', outline: 'none', fontFamily: 'monospace' }}
                        />
                      </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={saveMkt} disabled={contentSaving.marketing}
                        style={{ background: contentSaved.marketing ? S_SAVE_BG : GOLD2, color: contentSaved.marketing ? S_SAVE_T : BG, border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        {contentSaved.marketing ? '✓ Sauvegardé' : contentSaving.marketing ? '…' : '💾 Sauvegarder'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ─── JEKO TAB ─── */}
          {tab === 'jeko' && (() => {
            const filteredMembers = jekoMembers.filter(m => {
              const q = jekoMemberSearch.toLowerCase();
              return !q || m.email?.toLowerCase().includes(q) || (m.prenom + ' ' + m.nom).toLowerCase().includes(q);
            });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: GOLD }}>✦ SD Fidélité — Programme de Points</h2>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[
                    { label: 'Membres actifs', value: jekoStats.totalMembers, icon: '👥' },
                    { label: 'Points distribués', value: jekoStats.totalPointsDistributed.toLocaleString('fr-FR'), icon: '✦' },
                    { label: 'Échanges', value: jekoStats.totalRedemptions, icon: '🎁' },
                  ].map(s => (
                    <div key={s.label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '18px 20px' }}>
                      <p style={{ color: TEXT3, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.icon} {s.label}</p>
                      <p style={{ color: GOLD, fontSize: '26px', fontWeight: 900, marginTop: '6px' }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Sub-tab nav */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['config', 'membres', 'transactions'] as const).map(st => (
                    <button key={st} onClick={() => setJekoSubTab(st)}
                      style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: `1px solid ${jekoSubTab === st ? GOLD : BORDER}`, background: jekoSubTab === st ? `${GOLD}22` : 'transparent', color: jekoSubTab === st ? GOLD : TEXT2, textTransform: 'capitalize' }}>
                      {st === 'config' ? '⚙️ Configuration' : st === 'membres' ? '👥 Membres' : '📋 Transactions'}
                    </button>
                  ))}
                </div>

                {/* ── CONFIG SUB-TAB ── */}
                {jekoSubTab === 'config' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Paramètres */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px' }}>
                      <p style={{ color: GOLD, fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>⚙️ Paramètres généraux</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ color: TEXT3, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Points par 1000€</span>
                          <input type="number" value={jekoSettingsEdit.points_per_1000}
                            onChange={e => setJekoSettingsEdit(s => ({ ...s, points_per_1000: +e.target.value }))}
                            style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '9px 12px', color: TEXT, fontSize: '14px', fontWeight: 700, outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ color: TEXT3, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bonus bienvenue (pts)</span>
                          <input type="number" value={jekoSettingsEdit.welcome_bonus}
                            onChange={e => setJekoSettingsEdit(s => ({ ...s, welcome_bonus: +e.target.value }))}
                            style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '9px 12px', color: TEXT, fontSize: '14px', fontWeight: 700, outline: 'none' }} />
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '14px' }}>
                        <button onClick={jekoSaveSettings} disabled={jekoConfSaving}
                          style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', background: GOLD2, color: BG, opacity: jekoConfSaving ? 0.5 : 1 }}>
                          {jekoConfSaving ? '…' : '💾 Sauvegarder'}
                        </button>
                        {jekoConfMsg && <span style={{ fontSize: '12px', color: jekoConfMsg.ok ? '#4ade80' : '#f87171' }}>{jekoConfMsg.text}</span>}
                      </div>
                    </div>

                    {/* Paliers */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px' }}>
                      <p style={{ color: GOLD, fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>🏆 Paliers</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {jekoTiersConf.map((t, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: SURFACE2, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                            <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>{t.emoji}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 700, color: TEXT, fontSize: '13px' }}>{t.label}</p>
                              <p style={{ color: TEXT3, fontSize: '11px' }}>
                                {t.min} pts → {t.next !== null ? `${t.next} pts` : '∞'}
                                {i < jekoTiersConf.length - 1 && ` • prochain: ${jekoTiersConf[i + 1]?.label}`}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.color }} />
                              <button onClick={() => setJekoTierEdit({ ...t })}
                                style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2 }}>
                                Modifier
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Récompenses */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px' }}>
                      <p style={{ color: GOLD, fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>🎁 Récompenses</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {jekoRewardsConf.map((r, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: SURFACE2, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                            <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>{r.icon}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 700, color: TEXT, fontSize: '13px' }}>{r.label}</p>
                              <p style={{ color: TEXT3, fontSize: '11px' }}>{r.pts} pts · {r.description}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '99px', background: r.active ? 'rgba(74,222,128,.15)' : 'rgba(248,113,113,.15)', color: r.active ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                                {r.active ? 'Actif' : 'Inactif'}
                              </span>
                              <button onClick={() => setJekoRewardEdit({ ...r })}
                                style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2 }}>
                                Modifier
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── MEMBRES SUB-TAB ── */}
                {jekoSubTab === 'membres' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input placeholder="Rechercher par nom ou email…" value={jekoMemberSearch}
                        onChange={e => setJekoMemberSearch(e.target.value)}
                        style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 14px', color: TEXT, fontSize: '13px', outline: 'none' }} />
                      <a href="/api/jeko/export?type=members" download
                        style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: `1px solid ${BORDER2}`, background: 'rgba(200,151,74,0.08)', color: GOLD, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        ⬇ Exporter CSV
                      </a>
                    </div>

                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                            {['Membre', 'Email', 'Points', 'Palier', 'Inscrit', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMembers.length === 0 && (
                            <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: TEXT3, fontSize: '13px' }}>Aucun membre</td></tr>
                          )}
                          {filteredMembers.map(m => {
                            const tierInfo = jekoGetTierLabel(m.points ?? 0);
                            return (
                              <React.Fragment key={m.id}>
                                <tr style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }}
                                  onClick={() => {
                                    setJekoMemberSearch(prev => prev);
                                    loadMemberTxns(m.id); // uses component-level loadMemberTxns
                                    setJekoMemberTxns(prev => ({ ...prev }));
                                  }}>
                                  <td style={{ padding: '10px 14px', color: TEXT, fontSize: '13px', fontWeight: 600 }}>
                                    {[m.prenom, m.nom].filter(Boolean).join(' ') || '—'}
                                  </td>
                                  <td style={{ padding: '10px 14px', color: TEXT2, fontSize: '12px' }}>{m.email}</td>
                                  <td style={{ padding: '10px 14px', color: GOLD, fontSize: '14px', fontWeight: 800 }}>
                                    {(m.points ?? 0).toLocaleString('fr-FR')}
                                  </td>
                                  <td style={{ padding: '10px 14px' }}>
                                    {tierInfo && (
                                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '99px', background: `${tierInfo.color}22`, color: tierInfo.color, fontWeight: 700 }}>
                                        {tierInfo.emoji} {tierInfo.label}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '10px 14px', color: TEXT3, fontSize: '11px' }}>
                                    {new Date(m.created_at).toLocaleDateString('fr-FR')}
                                  </td>
                                  <td style={{ padding: '10px 14px' }}>
                                    <button
                                      onClick={e => { e.stopPropagation(); setJekoAdjMsg(null); setJekoAdjModal({ member: m, pts: '', label: '', notify: true }); }}
                                      style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'rgba(200,151,74,.15)', color: GOLD }}>
                                      ± Ajuster
                                    </button>
                                  </td>
                                </tr>
                                {/* Historique inline */}
                                {jekoMemberTxns[m.id] && (
                                  <tr>
                                    <td colSpan={6} style={{ padding: '0 14px 12px 14px', background: SURFACE2 }}>
                                      <p style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '10px 0 6px' }}>
                                        Dernières transactions
                                      </p>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {jekoMemberTxns[m.id].slice(0, 8).map(tx => (
                                          <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                                            <span style={{ color: tx.points > 0 ? '#4ade80' : '#f87171', fontWeight: 700, minWidth: '50px' }}>
                                              {tx.points > 0 ? '+' : ''}{tx.points}
                                            </span>
                                            <span style={{ color: TEXT2 }}>{tx.label ?? tx.reason}</span>
                                            <span style={{ color: TEXT3, marginLeft: 'auto', fontSize: '10px' }}>
                                              {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── TRANSACTIONS SUB-TAB ── */}
                {jekoSubTab === 'transactions' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <a href="/api/jeko/export?type=transactions" download
                        style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: `1px solid ${BORDER2}`, background: 'rgba(200,151,74,0.08)', color: GOLD, textDecoration: 'none' }}>
                        ⬇ Exporter CSV
                      </a>
                    </div>
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                          {['Date', 'User ID', 'Points', 'Raison', 'Label'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {jekoTxns.length === 0 && (
                          <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: TEXT3 }}>Aucune transaction</td></tr>
                        )}
                        {jekoTxns.map(tx => (
                          <tr key={tx.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                            <td style={{ padding: '9px 14px', color: TEXT3, fontSize: '11px' }}>
                              {new Date(tx.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td style={{ padding: '9px 14px', color: TEXT3, fontSize: '10px', fontFamily: 'monospace' }}>
                              {tx.user_id.slice(0, 8)}…
                            </td>
                            <td style={{ padding: '9px 14px', fontWeight: 800, fontSize: '13px', color: tx.points > 0 ? '#4ade80' : '#f87171' }}>
                              {tx.points > 0 ? '+' : ''}{tx.points}
                            </td>
                            <td style={{ padding: '9px 14px' }}>
                              <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '99px', background: SURFACE2, color: TEXT2, fontWeight: 600 }}>{tx.reason}</span>
                            </td>
                            <td style={{ padding: '9px 14px', color: TEXT2, fontSize: '12px' }}>{tx.label ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </div>
                )}

              </div>
            );
          })()}

        </main>
      </div>

      {/* ─── ORDER DETAIL MODAL ─── */}
      {orderDetail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} onClick={() => setOrderDetail(null)}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.7)', cursor: 'pointer' }} />
          <div style={{ width: '500px', background: SURFACE, borderLeft: `1px solid `, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ color: GOLD, fontSize: '16px', fontWeight: 700 }}>{orderDetail.orderNumber}</h2>
                <p style={{ color: TEXT3, fontSize: '12px', marginTop: '2px' }}>{formatOrderDate(orderDetail.date)}</p>
              </div>
              <button onClick={() => setOrderDetail(null)} style={{ color: TEXT3, fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <StatusBadge status={orderDetail.status} />
              <span style={{ color: TEXT3, fontSize: '12px' }}>{PAYMENT_LABELS[orderDetail.paymentMethod] ?? orderDetail.paymentMethod}</span>
            </div>
            <div style={{ background: SURFACE2, borderRadius: '8px', padding: '14px' }}>
              <p style={{ color: TEXT2, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Livraison</p>
              <p style={{ color: TEXT, fontSize: '13px', fontWeight: 600 }}>{orderDetail.delivery.firstName} {orderDetail.delivery.lastName}</p>
              <p style={{ color: TEXT2, fontSize: '12px' }}>{orderDetail.delivery.email}</p>
              <p style={{ color: TEXT2, fontSize: '12px' }}>{orderDetail.delivery.phone}</p>
              <p style={{ color: TEXT2, fontSize: '12px', marginTop: '4px' }}>{orderDetail.delivery.address}, {orderDetail.delivery.city}, {orderDetail.delivery.country}</p>
            </div>
            <div>
              <p style={{ color: TEXT2, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Articles ({orderDetail.items.reduce((s, i) => s + i.quantity, 0)})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {orderDetail.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: SURFACE2, borderRadius: '8px', padding: '10px' }}>
                    {item.product.images?.[0] && (
                      <Image src={item.product.images[0]} alt={item.product.name} width={42} height={42} style={{ objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: TEXT, fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</p>
                      <p style={{ color: TEXT3, fontSize: '11px' }}>x{item.quantity} — {formatPrice(item.product.price)} / unité</p>
                    </div>
                    <p style={{ color: GOLD, fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: SURFACE2, borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: TEXT3, fontSize: '12px' }}>Sous-total</span>
                <span style={{ color: TEXT, fontSize: '12px' }}>{formatPrice(orderDetail.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: TEXT3, fontSize: '12px' }}>Livraison</span>
                <span style={{ color: TEXT, fontSize: '12px' }}>{orderDetail.shippingCost === 0 ? 'Gratuite' : formatPrice(orderDetail.shippingCost)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: `1px solid ${BTN_BG}` }}>
                <span style={{ color: TEXT, fontSize: '14px', fontWeight: 700 }}>Total</span>
                <span style={{ color: GOLD, fontSize: '14px', fontWeight: 700 }}>{formatPrice(orderDetail.total)}</span>
              </div>
            </div>
            <div>
              <p style={{ color: TEXT2, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Changer le statut</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map(s => (
                  <button key={s.value}
                    onClick={() => {
                      handleStatusChange(orderDetail.orderNumber, s.value);
                      setOrderDetail(prev => prev ? { ...prev, status: s.value } : null);
                    }}
                    style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: orderDetail.status === s.value ? s.bg : 'transparent', color: orderDetail.status === s.value ? s.color : TEXT3, border: `1px solid ${orderDetail.status === s.value ? 'transparent' : BORDER3}` }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRODUCT MODAL ─── */}
      {productModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div onClick={() => setProductModal(null)} style={{ flex: 1, background: 'rgba(0,0,0,0.7)', cursor: 'pointer' }} />
          <div style={{ width: '460px', background: SURFACE, borderLeft: `1px solid `, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ color: TEXT, fontSize: '15px', fontWeight: 700 }}>{productModal._isNew ? '+ Nouveau produit' : 'Modifier le produit'}</h2>
              <button onClick={() => setProductModal(null)} style={{ color: TEXT3, fontSize: '18px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Nom *</label>
              <input value={productModal.name ?? ''} onChange={e => {
                const v = e.target.value;
                const slug = v
                  .toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '');
                setProductModal(p => p ? { ...p, name: v, slug } : p);
              }} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Slug (auto-généré)</label>
              <input value={productModal.slug ?? ''} readOnly style={{ ...inputStyle, color: TEXT3, fontFamily: 'monospace', fontSize: '12px', cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Catégorie *</label>
              <select value={productModal.category ?? ''} onChange={e => setProductModal(p => p ? { ...p, category: e.target.value as Category } : p)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">-- Choisir --</option>
                <option value="face">Visage</option>
                <option value="body">Corps</option>
                <option value="gammes">Gammes</option>
                <option value="kits">Kits</option>
                <option value="duo">Duo</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Prix (FCFA) *</label>
                <input type="number" min="0" value={productModal.price ?? ''} onChange={e => setProductModal(p => p ? { ...p, price: parseInt(e.target.value) || 0 } : p)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Prix barré</label>
                <input type="number" min="0" value={productModal.originalPrice ?? ''} onChange={e => { const v = parseInt(e.target.value); setProductModal(p => p ? { ...p, originalPrice: isNaN(v) || v === 0 ? undefined : v } : p); }} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Description courte</label>
              <input value={productModal.shortDescription ?? ''} onChange={e => setProductModal(p => p ? { ...p, shortDescription: e.target.value } : p)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Description complète</label>
              <textarea value={productModal.description ?? ''} onChange={e => setProductModal(p => p ? { ...p, description: e.target.value } : p)} rows={4} style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>{"Mode d'emploi"}</label>
              <textarea value={productModal.usage ?? ''} onChange={e => setProductModal(p => p ? { ...p, usage: e.target.value } : p)} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Ingrédients</label>
              <textarea value={productModal.ingredients ?? ''} onChange={e => setProductModal(p => p ? { ...p, ingredients: e.target.value || undefined } : p)} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Bienfaits (1 par ligne)</label>
              <textarea value={(productModal.benefits ?? []).join('\n')} onChange={e => setProductModal(p => p ? { ...p, benefits: e.target.value.split('\n').filter(Boolean) } : p)} rows={4} style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', color: TEXT2 }}>Images du produit</label>
                <button
                  type="button"
                  onClick={() => setProductModal(p => p ? { ...p, images: [...(p.images ?? []), ''] } : p)}
                  style={{ fontSize: '11px', color: GOLD, background: 'none', border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '2px 10px', cursor: 'pointer' }}
                >+ Ajouter</button>
              </div>
              {(productModal.images ?? []).length === 0 && (
                <p style={{ fontSize: '11px', color: TEXT3, textAlign: 'center', padding: '10px 0' }}>Aucune image — cliquez + Ajouter (au moins 1 image requise)</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(productModal.images ?? []).map((img, idx) => (
                  <div key={idx}
                    draggable
                    onDragStart={e => { e.dataTransfer.setData('text/img-idx', String(idx)); e.dataTransfer.effectAllowed = 'move'; }}
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                    onDrop={e => {
                      e.preventDefault();
                      const from = parseInt(e.dataTransfer.getData('text/img-idx'), 10);
                      if (Number.isNaN(from) || from === idx) return;
                      setProductModal(p => {
                        if (!p) return p;
                        const imgs = [...(p.images ?? [])];
                        const [moved] = imgs.splice(from, 1);
                        imgs.splice(idx, 0, moved);
                        return { ...p, images: imgs };
                      });
                    }}
                    style={{ position: 'relative', cursor: 'grab', border: `1px dashed ${BORDER}`, borderRadius: '8px', padding: '8px', background: SURFACE2 }}
                    title="Glissez pour réordonner"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ color: TEXT3, fontSize: '14px', userSelect: 'none' }}>⋮⋮</span>
                      <span style={{ fontSize: '11px', color: TEXT3 }}>Position {idx + 1}{idx === 0 && ' · principale'}</span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                        <button type="button" disabled={idx === 0}
                          onClick={() => setProductModal(p => {
                            if (!p) return p;
                            const imgs = [...(p.images ?? [])];
                            [imgs[idx - 1], imgs[idx]] = [imgs[idx], imgs[idx - 1]];
                            return { ...p, images: imgs };
                          })}
                          style={{ background: 'transparent', color: idx === 0 ? TEXT3 : TEXT2, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '2px 7px', fontSize: '10px', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>↑</button>
                        <button type="button" disabled={idx === (productModal.images?.length ?? 0) - 1}
                          onClick={() => setProductModal(p => {
                            if (!p) return p;
                            const imgs = [...(p.images ?? [])];
                            if (idx >= imgs.length - 1) return p;
                            [imgs[idx], imgs[idx + 1]] = [imgs[idx + 1], imgs[idx]];
                            return { ...p, images: imgs };
                          })}
                          style={{ background: 'transparent', color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '2px 7px', fontSize: '10px', cursor: 'pointer' }}>↓</button>
                      </div>
                    </div>
                    <ImageUpload
                      value={img}
                      onChange={url => setProductModal(p => {
                        if (!p) return p;
                        const imgs = [...(p.images ?? [])];
                        imgs[idx] = url;
                        return { ...p, images: imgs };
                      })}
                      folder="products"
                      label={`Image ${idx + 1}`}
                      previewSize={110}
                    />
                    <button
                      type="button"
                      onClick={() => setProductModal(p => {
                        if (!p) return p;
                        const imgs = [...(p.images ?? [])];
                        imgs.splice(idx, 1);
                        return { ...p, images: imgs };
                      })}
                      style={{ position: 'absolute', top: 6, right: 6, background: S_ERR_BG, color: S_ERR_T, border: 'none', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', cursor: 'pointer' }}
                    >✕ Supprimer</button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '6px' }}>Teintes compatibles</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {(['noir', 'marron', 'marron-clair', 'clair', 'metisse'] as SkinTone[]).map(tone => (
                  <label key={tone} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={(productModal.skinTones ?? []).includes(tone)} onChange={e => setProductModal(p => { if (!p) return p; const t = p.skinTones ?? []; return { ...p, skinTones: e.target.checked ? [...t, tone] : t.filter(x => x !== tone) }; })} style={{ accentColor: GOLD2 }} />
                    <span style={{ fontSize: '12px', color: TEXT }}>{tone}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: TEXT2 }}>Quantité en stock <span style={{ color: TEXT3 }}>(vide = ignoré)</span></span>
                <input type="number" min={0} placeholder="ex: 25"
                  value={productModal.stockQty ?? ''}
                  onChange={e => { const v = e.target.value; setProductModal(p => p ? { ...p, stockQty: v === '' ? undefined : Math.max(0, parseInt(v, 10) || 0) } : p); }}
                  style={inputStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: TEXT2 }}>Seuil alerte stock bas <span style={{ color: TEXT3 }}>(défaut 5)</span></span>
                <input type="number" min={0} placeholder="5"
                  value={productModal.lowStockThreshold ?? ''}
                  onChange={e => { const v = e.target.value; setProductModal(p => p ? { ...p, lowStockThreshold: v === '' ? undefined : Math.max(0, parseInt(v, 10) || 0) } : p); }}
                  style={inputStyle} />
              </label>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '6px' }}>Badges</label>
              <div style={{ display: 'flex', gap: '20px' }}>
                {([{ key: 'inStock', label: 'En stock' }, { key: 'isNew', label: 'Nouveau' }, { key: 'isBestseller', label: 'Bestseller' }]).map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!((productModal as Record<string, unknown>)[key])} onChange={e => setProductModal(p => p ? { ...p, [key]: e.target.checked } : p)} style={{ accentColor: GOLD2 }} />
                    <span style={{ fontSize: '12px', color: TEXT }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: `1px solid ${BTN_BG}` }}>
              <button onClick={saveModal} disabled={!productModal.name?.trim() || !productModal.slug?.trim() || !productModal.category || (productModal.images ?? []).filter(u => u && u.trim()).length === 0} style={{ flex: 1, padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: GOLD2, color: BG, cursor: 'pointer', border: 'none', opacity: !productModal.name?.trim() || !productModal.slug?.trim() || !productModal.category || (productModal.images ?? []).filter(u => u && u.trim()).length === 0 ? 0.4 : 1 }}>
                {productModal._isNew ? '+ Ajouter' : '✓ Enregistrer'}
              </button>
              <button onClick={() => setProductModal(null)} style={{ padding: '10px 16px', borderRadius: '6px', fontSize: '13px', background: SURFACE2, color: TEXT2, cursor: 'pointer', border: 'none' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── JEKO ADJUST MODAL ─── */}
      {jekoAdjModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '28px', width: '340px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: GOLD, fontWeight: 700, fontSize: '14px' }}>± Ajustement points</p>
              <button onClick={() => { setJekoAdjModal(null); setJekoAdjMsg(null); }} style={{ background: 'none', border: 'none', color: TEXT3, fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ color: TEXT2, fontSize: '12px' }}>
              {[jekoAdjModal.member.prenom, jekoAdjModal.member.nom].filter(Boolean).join(' ') || jekoAdjModal.member.email}<br />
              <span style={{ color: TEXT3 }}>Points actuels : <b style={{ color: GOLD }}>{(jekoAdjModal.member.points ?? 0).toLocaleString('fr-FR')}</b></span>
            </p>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '11px', color: TEXT2 }}>Points (ex: +50 ou -20)</span>
              <input type="number" value={jekoAdjModal.pts} placeholder="+50 ou -20"
                onChange={e => setJekoAdjModal(m => m ? { ...m, pts: e.target.value } : m)}
                style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '14px', outline: 'none', fontWeight: 700 }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '11px', color: TEXT2 }}>Raison (affiché dans l&apos;historique)</span>
              <input type="text" value={jekoAdjModal.label} placeholder="Remboursement, cadeau..."
                onChange={e => setJekoAdjModal(m => m ? { ...m, label: e.target.value } : m)}
                style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: TEXT2, cursor: 'pointer' }}>
              <input type="checkbox" checked={jekoAdjModal.notify}
                onChange={e => setJekoAdjModal(m => m ? { ...m, notify: e.target.checked } : m)}
                style={{ accentColor: GOLD2 }} />
              ✉ Notifier le client par email
            </label>
            {jekoAdjMsg && <p style={{ fontSize: '12px', color: jekoAdjMsg.ok ? '#4ade80' : '#f87171', fontWeight: 600 }}>{jekoAdjMsg.text}</p>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setJekoAdjModal(null); setJekoAdjMsg(null); }}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2 }}>
                Annuler
              </button>
              <button onClick={handleJekoAdjust} disabled={jekoAdjSaving}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', background: GOLD2, color: BG, opacity: jekoAdjSaving ? 0.5 : 1 }}>
                {jekoAdjSaving ? '…' : 'Appliquer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── JEKO TIER EDIT MODAL ─── */}
      {jekoTierEdit && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '28px', width: '340px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: GOLD, fontWeight: 700, fontSize: '14px' }}>Modifier le palier</p>
              <button onClick={() => setJekoTierEdit(null)} style={{ background: 'none', border: 'none', color: TEXT3, fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            {(['emoji', 'label', 'color', 'min', 'next'] as const).map(k => (
              <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '11px', color: TEXT2 }}>{k === 'min' ? 'Points min' : k === 'next' ? 'Points max (vide = ∞)' : k.charAt(0).toUpperCase() + k.slice(1)}</span>
                <input type={k === 'min' || k === 'next' ? 'number' : 'text'} value={jekoTierEdit[k] ?? ''}
                  onChange={e => setJekoTierEdit(t => t ? { ...t, [k]: k === 'min' || k === 'next' ? (e.target.value ? parseInt(e.target.value) : null) : e.target.value } : t)}
                  style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
              </label>
            ))}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button onClick={() => setJekoTierEdit(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2 }}>
                Annuler
              </button>
              <button onClick={() => jekoSaveTier(jekoTierEdit)}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', background: GOLD2, color: BG }}>
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── JEKO REWARD EDIT MODAL ─── */}
      {jekoRewardEdit && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '28px', width: '360px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ color: GOLD, fontWeight: 700, fontSize: '14px' }}>Modifier la récompense</p>
              <button onClick={() => setJekoRewardEdit(null)} style={{ background: 'none', border: 'none', color: TEXT3, fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            {(['icon', 'label', 'pts', 'description'] as const).map(k => (
              <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '11px', color: TEXT2 }}>{k === 'pts' ? 'Coût en points' : k.charAt(0).toUpperCase() + k.slice(1)}</span>
                <input type={k === 'pts' ? 'number' : 'text'} value={jekoRewardEdit[k] ?? ''}
                  onChange={e => setJekoRewardEdit(r => r ? { ...r, [k]: k === 'pts' ? parseInt(e.target.value) || 0 : e.target.value } : r)}
                  style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
              </label>
            ))}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={jekoRewardEdit.active ?? true}
                onChange={e => setJekoRewardEdit(r => r ? { ...r, active: e.target.checked } : r)}
                style={{ accentColor: GOLD2, width: '16px', height: '16px' }} />
              <span style={{ fontSize: '12px', color: TEXT2 }}>Récompense active</span>
            </label>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button onClick={() => setJekoRewardEdit(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2 }}>
                Annuler
              </button>
              <button onClick={() => jekoSaveReward(jekoRewardEdit)}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', background: GOLD2, color: BG }}>
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CONFIRM DELETE ─── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '28px', width: '300px', textAlign: 'center' as const }}>
            <p style={{ color: TEXT, marginBottom: '8px', fontWeight: 600 }}>Supprimer ce produit ?</p>
            <p style={{ color: TEXT3, fontSize: '12px', marginBottom: '24px' }}>Cette action est irréversible.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleDeleteProduct(confirmDelete!)} style={{ flex: 1, padding: '9px', borderRadius: '6px', background: S_ERR_BG, color: S_ERR_T, fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>Supprimer</button>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '9px', borderRadius: '6px', background: SURFACE2, color: TEXT2, fontSize: '13px', cursor: 'pointer', border: 'none' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

