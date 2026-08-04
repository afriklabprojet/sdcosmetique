'use client';

import Image from 'next/image';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/shared/supabase/browser.client';
import { formatOrderDate, updateOrderStatus, OrderDraft } from '@/features/orders/order.store';
import { formatPrice } from '@/features/catalog/product.query';
import { Product, Category, SkinTone, Review } from '@/shared/types/domain.type';
import { fetchAllReviews, deleteReview, approveReview } from '@/features/catalog/review.repository';

import { deleteProduct, saveSiteConfigSection } from '@/features/admin/admin-actions';
import type { AdminTabStatus } from '@/features/admin/admin.type';
import { DEFAULT_SITE_CONFIG } from '@/features/site-config/site-config.constant';
import type { SiteConfig } from '@/features/site-config/site-config.type';
import ImageUpload from '@/shared/ui/image.input';
import { fetchAllTestimonialsAdmin, approveTestimonial, deleteTestimonial } from '@/features/testimonials/testimonial.repository';
import type { TestimonialRow } from '@/features/testimonials/testimonial.repository';
import { fetchAllCategoriesAdmin } from '@/features/catalog/category.repository';
import type { CategoryRow } from '@/features/catalog/category.repository';
import { fetchAllConcernsAdmin, fetchAllRoutinesAdmin } from '@/features/quiz/quiz.repository';
import type { QuizConcern, QuizRoutine } from '@/features/quiz/quiz.repository';
import {
  getJekoSettings, getJekoTiersConfig, getJekoRewardsConfig, saveJekoConfig,
  getJekoMembers, getAllJekoTransactions, manualJekoAdjustment, getJekoStats,
} from '@/features/loyalty/jeko-admin.repository';
import type { JekoTierConfig, JekoRewardConfig, JekoMember, JekoTransactionAdmin, JekoStats, JekoSettings } from '@/features/loyalty/jeko-admin.repository';

// Composants extraits
import StatusBadge from '@/features/admin/badges/status.badge';
import { paginateData, calculateDashboardMetrics, calculateLast7DaysData } from '@/features/admin/admin.metric';
import { BG, SURFACE, SURFACE2, BORDER, BORDER2, GOLD, TEXT, TEXT2, TEXT3, GOLD2, BTN_BG, BORDER3, S_ERR_BG, S_ERR_T, S_SAVE_BG, S_SAVE_T, GOLD_D3, PER_PAGE, STATUS_OPTIONS, PAYMENT_LABELS } from '@/features/admin/admin.constant';
import { getSaveButtonText, getTabColor } from '@/features/admin/admin.util';

// Onglets extraits en vague `split` (F-110)
import { DashboardTab } from '@/features/admin/tabs/dashboard.tab';
import { OrdersTab } from '@/features/admin/tabs/orders.tab';
import { ProductsTab } from '@/features/admin/tabs/products.tab';
import ReviewsTab from '@/features/admin/tabs/reviews.tab';
import TestimonialsTab from '@/features/admin/tabs/testimonials.tab';
import CategoriesTab from '@/features/admin/tabs/categories.tab';
import ClientsTab from '@/features/admin/tabs/clients.tab';
import QuizTab from '@/features/admin/tabs/quiz.tab';
import NewsletterTab from '@/features/admin/tabs/newsletter.tab';
import ShippingTab from '@/features/admin/tabs/shipping.tab';
import ContentTab from '@/features/admin/tabs/content.tab';
import LegalTab from '@/features/admin/tabs/legal.tab';
import FaqTab from '@/features/admin/tabs/faq.tab';
import HeroTab from '@/features/admin/tabs/hero.tab';
import PromosTab from '@/features/admin/tabs/promos.tab';
import BrandingTab from '@/features/admin/tabs/branding.tab';
import PaymentTab from '@/features/admin/tabs/payment.tab';
import MarketingTab from '@/features/admin/tabs/marketing.tab';
import JekoTab from '@/features/admin/tabs/jeko.tab';

type OrderStatus = OrderDraft['status'];
type ReviewRow = Review & { productId?: string };
type ProductModalState = Partial<Product> & { _isNew?: boolean };
type Tab = 'dashboard' | 'commandes' | 'produits' | 'avis' | 'temoignages' | 'categories' | 'quiz' | 'clients' | 'contenu' | 'jeko' | 'newsletter' | 'livraison' | 'marketing' | 'branding' | 'promos' | 'faq' | 'hero' | 'legal' | 'paiement';
type NewsletterSub = { id: string; email: string; source: string | null; unsubscribed: boolean; created_at: string };

async function fetchAdminOrders(): Promise<OrderDraft[]> {
  const res = await fetch('/api/admin/orders', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? `Erreur ${res.status}`);
  }
  return Array.isArray(data?.orders) ? (data.orders as OrderDraft[]) : [];
}

async function patchAdminOrderStatus(orderNumber: string, status: OrderDraft['status']): Promise<void> {
  const res = await fetch('/api/admin/orders', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNumber, status }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? `Erreur ${res.status}`);
  }
}

type ProductEditModalProps = {
  /** Produit ouvert a l'edition. Le brouillon qui en decoule vit dans la modale. */
  initialProduct: ProductModalState;
  saveDraft: (draft: ProductModalState) => void;
  close: () => void;
  inputStyle: React.CSSProperties;
  SURFACE: string;
  TEXT: string;
  TEXT2: string;
  TEXT3: string;
  BORDER: string;
  BG: string;
  GOLD2: string;
  SURFACE2: string;
  BTN_BG: string;
  S_ERR_BG: string;
  S_ERR_T: string;
  saving?: boolean;
  saveError?: string | null;
};

/*
 * La modale recevait le `Dispatch` du parent et ecrivait directement dans son
 * etat a chaque frappe. Le brouillon en cours d'edition est pourtant de la
 * presentation : il n'existe que tant que la modale est ouverte, et l'admin
 * n'a besoin que du produit finalement enregistre. Le parent decide encore
 * quel produit ouvrir — c'est son affaire ; la saisie, non.
 */
function ProductEditModal({ 
  initialProduct, saveDraft, close, inputStyle,
  SURFACE, TEXT, TEXT2, TEXT3, BORDER, BG, GOLD2, SURFACE2, BTN_BG, S_ERR_BG, S_ERR_T,
  saving, saveError
}: Readonly<ProductEditModalProps>) {
  const [productModal, setProductModal] = useState<ProductModalState | null>(initialProduct);

  if (!productModal) return null;

  // Fonction utilitaire pour gérer les teintes compatibles
  const selectSkinTone = (tone: SkinTone, checked: boolean) => {
    setProductModal((p) => {
      if (!p) return p;
      const currentTones = p.skinTones ?? [];
      return {
        ...p,
        skinTones: checked 
          ? [...currentTones, tone] 
          : currentTones.filter((x) => x !== tone)
      };
    });
  };

  const saveLabel = productModal._isNew ? '+ Ajouter' : '✓ Enregistrer';
  const btnLabel = saving ? '⏳ Enregistrement...' : saveLabel;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
      <button 
        onClick={() => close()} 
        onKeyDown={(e) => { if (e.key === 'Escape') close(); }}
        style={{ 
          flex: 1, 
          background: 'rgba(0,0,0,0.7)', 
          cursor: 'pointer', 
          border: 'none',
          padding: 0
        }} 
        aria-label="Fermer le modal"
      />
      <div style={{ width: '460px', background: SURFACE, borderLeft: `1px solid `, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ color: TEXT, fontSize: '15px', fontWeight: 700 }}>{productModal._isNew ? '+ Nouveau produit' : 'Modifier le produit'}</h2>
          <button onClick={() => close()} style={{ color: TEXT3, fontSize: '18px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        <div>
          <label htmlFor="product-name" style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Nom *</label>
          <input 
            id="product-name"
            value={productModal.name ?? ''} 
            onChange={(e) => {
              const v = e.target.value;
              const slug = v
                .toLowerCase()
                .normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '')
                .replaceAll(/[^a-z0-9]+/g, '-')
                .replaceAll(/^-+|-+$/g, '');
              setProductModal((p) => p ? { ...p, name: v, slug } : p);
            }} 
            style={inputStyle} 
          />
        </div>
        <div>
          <label htmlFor="product-slug" style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Slug (auto-généré)</label>
          <input 
            id="product-slug"
            value={productModal.slug ?? ''} 
            readOnly 
            style={{ ...inputStyle, color: TEXT3, fontFamily: 'monospace', fontSize: '12px', cursor: 'not-allowed' }} 
          />
        </div>
        <div>
          <label htmlFor="product-category" style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Catégorie *</label>
          <select 
            id="product-category"
            value={productModal.category ?? ''} 
            onChange={(e) => setProductModal((p) => p ? { ...p, category: e.target.value as Category } : p)} 
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
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
            <label htmlFor="product-price" style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Prix (FCFA) *</label>
            <input 
              id="product-price"
              type="number" 
              min="0" 
              value={productModal.price ?? ''} 
              onChange={(e) => setProductModal((p) => p ? { ...p, price: Number.parseInt(e.target.value, 10) || 0 } : p)} 
              style={inputStyle} 
            />
          </div>
          <div>
            <label htmlFor="product-original-price" style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Prix barré</label>
            <input 
              id="product-original-price"
              type="number" 
              min="0" 
              value={productModal.originalPrice ?? ''} 
              onChange={(e) => { const v = Number.parseInt(e.target.value, 10); setProductModal((p) => p ? { ...p, originalPrice: Number.isNaN(v) || v === 0 ? undefined : v } : p); }} 
              style={inputStyle} 
            />
          </div>
        </div>
        <div>
          <label htmlFor="product-short-desc" style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Description courte</label>
          <input 
            id="product-short-desc"
            value={productModal.shortDescription ?? ''} 
            onChange={(e) => setProductModal((p) => p ? { ...p, shortDescription: e.target.value } : p)} 
            style={inputStyle} 
          />
        </div>
        <div>
          <label htmlFor="product-description" style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Description complète</label>
          <textarea 
            id="product-description"
            value={productModal.description ?? ''} 
            onChange={(e) => setProductModal((p) => p ? { ...p, description: e.target.value } : p)} 
            rows={4} 
            style={{ ...inputStyle, resize: 'vertical' as const }} 
          />
        </div>
        <div>
          <label htmlFor="product-usage" style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Mode d&apos;emploi</label>
          <textarea 
            id="product-usage"
            value={productModal.usage ?? ''} 
            onChange={(e) => setProductModal((p) => p ? { ...p, usage: e.target.value } : p)} 
            rows={3} 
            style={{ ...inputStyle, resize: 'vertical' as const }} 
          />
        </div>
        <div>
          <label htmlFor="product-ingredients" style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Ingrédients</label>
          <textarea value={productModal.ingredients ?? ''} onChange={(e) => setProductModal((p) => p ? { ...p, ingredients: e.target.value || undefined } : p)} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
        </div>
        <div>
          <label htmlFor="product-benefits" style={{ fontSize: '11px', color: TEXT2, display: 'block', marginBottom: '4px' }}>Bienfaits (1 par ligne)</label>
          <textarea 
            id="product-benefits"
            value={(productModal.benefits ?? []).join('\n')} 
            onChange={(e) => setProductModal((p) => p ? { ...p, benefits: e.target.value.split('\n').filter(Boolean) } : p)} 
            rows={4} 
            style={{ ...inputStyle, resize: 'vertical' as const }} 
          />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label htmlFor="product-images" style={{ fontSize: '11px', color: TEXT2 }}>Images du produit</label>
            <button
              type="button"
              onClick={() => setProductModal((p) => p ? { ...p, images: [...(p.images ?? []), ''] } : p)}
              style={{ fontSize: '11px', color: GOLD2, background: 'none', border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '2px 10px', cursor: 'pointer' }}
            >+ Ajouter</button>
          </div>
          {(productModal.images ?? []).length === 0 && (
            <p style={{ fontSize: '11px', color: TEXT3, textAlign: 'center', padding: '10px 0' }}>Aucune image — cliquez + Ajouter (au moins 1 image requise)</p>
          )}
          <ul aria-label="Images du produit — réordonnables" style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', margin: 0, padding: 0 }}>
            {(productModal.images ?? []).map((img: string, idx: number) => (
              <li key={`product-img-${idx}-${img.slice(-10)}`}
                draggable
                onDragStart={(e) => { e.dataTransfer.setData('text/img-idx', String(idx)); e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = Number.parseInt(e.dataTransfer.getData('text/img-idx'), 10);
                  if (Number.isNaN(from) || from === idx) return;
                  setProductModal((p) => {
                    if (!p) return p;
                    const imgs = [...(p.images ?? [])];
                    const [moved] = imgs.splice(from, 1);
                    imgs.splice(idx, 0, moved);
                    return { ...p, images: imgs };
                  });
                }}
                aria-label={`Image ${idx + 1}${idx === 0 ? ' (principale)' : ''} — utilisez les flèches ↑↓ pour réordonner`}
                style={{ position: 'relative', cursor: 'grab', border: `1px dashed ${BORDER}`, borderRadius: '8px', padding: '8px', background: SURFACE2 }}
                title="Glissez ou utilisez ↑↓ pour réordonner"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ color: TEXT3, fontSize: '14px', userSelect: 'none' }}>⋮⋮</span>
                  <span style={{ fontSize: '11px', color: TEXT3 }}>Position {idx + 1}{idx === 0 && ' · principale'}</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                    <button type="button" disabled={idx === 0}
                      onClick={() => setProductModal((p) => {
                        if (!p) return p;
                        const imgs = [...(p.images ?? [])];
                        [imgs[idx - 1], imgs[idx]] = [imgs[idx], imgs[idx - 1]];
                        return { ...p, images: imgs };
                      })}
                      style={{ background: 'transparent', color: idx === 0 ? TEXT3 : TEXT2, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '2px 7px', fontSize: '10px', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>↑</button>
                    <button type="button" disabled={idx === (productModal.images?.length ?? 0) - 1}
                      onClick={() => setProductModal((p) => {
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
                  selectImage={(url: string) => setProductModal((p) => {
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
                  onClick={() => setProductModal((p) => {
                    if (!p) return p;
                    const imgs = [...(p.images ?? [])];
                    imgs.splice(idx, 1);
                    return { ...p, images: imgs };
                  })}
                  style={{ position: 'absolute', top: 6, right: 6, background: S_ERR_BG, color: S_ERR_T, border: 'none', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', cursor: 'pointer' }}
                >✕ Supprimer</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <fieldset>
            <legend style={{ fontSize: '11px', color: TEXT2, marginBottom: '6px' }}>Teintes compatibles</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {(['noir', 'marron', 'marron-clair', 'clair', 'metisse'] as SkinTone[]).map((tone: SkinTone) => (
              <label key={tone} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={(productModal.skinTones ?? []).includes(tone)} 
                  onChange={(e) => selectSkinTone(tone, e.target.checked)} 
                  style={{ accentColor: GOLD2 }} 
                />
                <span style={{ fontSize: '12px', color: TEXT }}>{tone}</span>
              </label>
            ))}
          </div>
          </fieldset>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: TEXT2 }}>Quantité en stock <span style={{ color: TEXT3 }}>(vide = ignoré)</span></span>
            <input type="number" min={0} placeholder="ex: 25"
              value={productModal.stockQty ?? ''}
              onChange={(e) => { const v = e.target.value; setProductModal((p) => p ? { ...p, stockQty: v === '' ? undefined : Math.max(0, Number.parseInt(v, 10) || 0) } : p); }}
              style={inputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: TEXT2 }}>Seuil alerte stock bas <span style={{ color: TEXT3 }}>(défaut 5)</span></span>
            <input type="number" min={0} placeholder="5"
              value={productModal.lowStockThreshold ?? ''}
              onChange={(e) => { const v = e.target.value; setProductModal((p) => p ? { ...p, lowStockThreshold: v === '' ? undefined : Math.max(0, Number.parseInt(v, 10) || 0) } : p); }}
              style={inputStyle} />
          </label>
        </div>
        <fieldset>
          <legend style={{ fontSize: '11px', color: TEXT2, marginBottom: '6px' }}>Badges</legend>
          <div style={{ display: 'flex', gap: '20px' }}>
            {([{ key: 'inStock', label: 'En stock' }, { key: 'newArrival', label: 'Nouveau' }, { key: 'bestseller', label: 'Bestseller' }]).map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!((productModal as Record<string, unknown>)[key])} onChange={(e) => setProductModal((p) => p ? { ...p, [key]: e.target.checked } : p)} style={{ accentColor: GOLD2 }} />
                <span style={{ fontSize: '12px', color: TEXT }}>{label}</span>
              </label>
            ))}
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
            <span style={{ fontSize: '11px', color: TEXT2 }}>Badges personnalisés <span style={{ color: TEXT3 }}>(séparés par virgule, ex: &quot;Bestseller, -22%&quot;)</span></span>
            <input
              type="text"
              value={(productModal.badges ?? []).join(', ')}
              onChange={(e) => {
                const val = e.target.value;
                const arr = val.split(',').map(s => s.trim()).filter(Boolean);
                setProductModal((p) => p ? { ...p, badges: arr } : p);
              }}
              placeholder="Bestseller, -22%, Nouveau"
              style={inputStyle}
            />
          </label>
        </fieldset>
        {saveError && (
          <div style={{ background: S_ERR_BG, color: S_ERR_T, borderRadius: '6px', padding: '10px 12px', fontSize: '12px', lineHeight: '1.4' }}>
            ❌ {saveError}
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: `1px solid ${BTN_BG}` }}>
          <button onClick={() => saveDraft(productModal)} disabled={saving || !productModal.name?.trim() || !productModal.slug?.trim() || !productModal.category || productModal.images?.filter((u: string) => u?.trim()).length === 0} style={{ flex: 1, padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, background: GOLD2, color: BG, cursor: saving ? 'wait' : 'pointer', border: 'none', opacity: saving || !productModal.name?.trim() || !productModal.slug?.trim() || !productModal.category || productModal.images?.filter((u: string) => u?.trim()).length === 0 ? 0.4 : 1 }}>
            {btnLabel}
          </button>
          <button onClick={() => close()} disabled={saving} style={{ padding: '10px 16px', borderRadius: '6px', fontSize: '13px', background: SURFACE2, color: TEXT2, cursor: saving ? 'not-allowed' : 'pointer', border: 'none' }}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

/*
 * La palette, `PER_PAGE` et les styles partages sont partis dans
 * `admin.constant.ts` en vague `split` (F-110) : les dix-neuf onglets extraits
 * les lisent tous.
 */

// ─── Helper functions pour réduire la complexité cognitive ──────────────────────────

// ─── OrdersTab Component ─────────────────────────────────────────────

// ─── CSV export ───────────────────────────────────────────────────────────────
// ─── Composants extraits pour réduire la complexité ───────────────────────────
// ─── Composants utilitaires (module-level) ──────────────────────────────────
// ─── Inline editable product state ───────────────────────────────────────────
type EditableProduct = Product

// Fonctions utilitaires pour les boutons de sauvegarde

async function applySiteConfigRows(setSiteContent: (cfg: SiteConfig) => void) {
  const { data: cfgRows } = await createClient().from('site_config').select('key, value');
  if (cfgRows?.length) {
    const cfg = structuredClone(DEFAULT_SITE_CONFIG) as SiteConfig;
    for (const row of cfgRows) {
      if (row.key in cfg) (cfg as Record<string, unknown>)[row.key] = row.value;
    }
    setSiteContent(cfg);
  }
}

function fetchNewsletterSubs(setNewsletterSubs: (subs: NewsletterSub[]) => void) {
  fetch('/api/newsletter/list')
    .then(r => r.ok ? r.json() : { subscribers: [] })
    .then((d: { subscribers?: NewsletterSub[] }) => setNewsletterSubs(d.subscribers ?? []))
    .catch(() => setNewsletterSubs([]));
}

function loadEditableProducts(setEditableProducts: (p: Product[]) => void) {
  fetch('/api/admin/products', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status}`)))
    .then((products: Product[]) => setEditableProducts(products))
    .catch(() => setEditableProducts([]));
}

export default function AdminPage() { // NOSONAR typescript:S3776
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<OrderDraft[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // search

  // pagination

  // inline product editing
  const [editableProducts, setEditableProducts] = useState<EditableProduct[]>([]);
  // product modal (null = closed)
  const [productModal, setProductModal] = useState<ProductModalState | null>(null);
  const [saving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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
  const [jekoTiersConf, setJekoTiersConf] = useState<JekoTierConfig[]>([]);
  const [jekoRewardsConf, setJekoRewardsConf] = useState<JekoRewardConfig[]>([]);
  const [jekoMembers, setJekoMembers] = useState<JekoMember[]>([]);
  const [jekoTxns, setJekoTxns] = useState<JekoTransactionAdmin[]>([]);
  const [jekoStats, setJekoStats] = useState<JekoStats>({ totalMembers: 0, totalPointsDistributed: 0, totalRedemptions: 0 });
  const [jekoSettingsEdit, setJekoSettingsEdit] = useState<JekoSettings | null>(null);
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

  const reloadNewsletter = () => fetchNewsletterSubs(setNewsletterSubs);

  const initAfterAuth = useCallback(async (user: { email?: string | null }) => {
    setAuthChecked(true);
    setUserEmail(user.email ?? '');
    fetchAdminOrders().then(setOrders).catch(() => setOrders([]));
    loadEditableProducts(setEditableProducts);
    fetchAllReviews().then(rows => setReviews(rows as ReviewRow[]));
    fetchAllTestimonialsAdmin().then(setTestimonials);
    fetchAllCategoriesAdmin().then(setCategories);
    fetchAllConcernsAdmin().then(setQuizConcerns);
    fetchAllRoutinesAdmin().then(setQuizRoutines);
    reloadNewsletter();
    getJekoSettings().then(s => { setJekoSettingsEdit(s); });
    getJekoTiersConfig().then(setJekoTiersConf);
    getJekoRewardsConfig().then(setJekoRewardsConf);
    getJekoMembers().then(setJekoMembers);
    getAllJekoTransactions().then(setJekoTxns);
    getJekoStats().then(setJekoStats);
    void applySiteConfigRows(setSiteContent);
   
  }, []);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) {
        void initAfterAuth(data.user);
      } else {
        router.replace('/admin/login');
      }
    });
  }, [router, initAfterAuth]);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const changeStatus = async (orderNumber: string, status: OrderStatus) => {
    const previousOrders = orders;
    updateOrderStatus(orderNumber, status);
    setOrders(prev => prev.map(o => o.orderNumber === orderNumber ? { ...o, status } : o));
    try {
      await patchAdminOrderStatus(orderNumber, status);
    } catch {
      setOrders(previousOrders);
    }
    // Email d'expédition (fire & forget)
    if (status === 'shipped') {
      fetch('/api/orders/notify-shipped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber }),
      }).catch(() => {});
    }
  };

  // ── product modal helpers ──
  const openEditModal = (p: EditableProduct) => setProductModal({ ...p, _isNew: false });
  const openNewModal = () => setProductModal({
    _isNew: true, id: `p${Date.now()}`, name: '', slug: '', category: 'face' as Category,
    price: 0, images: [''], skinTones: [], benefits: [], rating: 0, reviewCount: 0,
    shortDescription: '', description: '', usage: '', inStock: true, stockQty: 0, lowStockThreshold: 5, newArrival: false, bestseller: false,
  });
  const saveModal = async (draft: ProductModalState) => {
    if (!draft?.name?.trim() || !draft?.slug?.trim() || !draft?.category) return;
    const validImages = draft.images?.filter((u: string) => u?.trim()) ?? [];
    if (validImages.length === 0) return;
    const { _isNew, ...rest } = draft;
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
      newArrival: rest.newArrival,
      bestseller: rest.bestseller,
    };
    setIsSaving(true);
    setSaveError(null);
    try {
      console.log('[admin] POST /api/admin/products payload:', {
        id: p.id, inStock: p.inStock, badges: p.badges, newArrival: p.newArrival, bestseller: p.bestseller, stockQty: p.stockQty,
      });
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      console.log('[admin] POST result:', res.status, data);
      if (!res.ok) {
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }
      if (_isNew) {
        setEditableProducts(prev => [...prev, p]);
      } else {
        setEditableProducts(prev => prev.map(x => x.id === p.id ? p : x));
      }
      // Re-fetch DB pour vérifier la persistance réelle
      loadEditableProducts(setEditableProducts);
      setProductModal(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };
  const removeProduct = async (id: string) => {
    await deleteProduct(id);
    setEditableProducts(prev => prev.filter(p => p.id !== id));
    setConfirmDelete(null);
  };
  const removeReview = async (id: string) => {
    await deleteReview(id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };
  const toggleReview = async (id: string, current: boolean) => {
    await approveReview(id, !current);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, verified: !current } : r));
  };

  // ── section-save helpers ──
  const clearSectionSaved = (key: string) => setContentSaved(s => ({ ...s, [key]: false }));
  const saveConfigSection = async (key: string, value: unknown) => {
    setContentSaving(s => ({ ...s, [key]: true }));
    try {
      await saveSiteConfigSection(key as keyof SiteConfig, value as SiteConfig[keyof SiteConfig]);
      setContentSaved(s => ({ ...s, [key]: true }));
      setTimeout(() => clearSectionSaved(key), 2500);
    } catch (err) {
      console.error('Erreur sauvegarde config:', key, err);
      alert(`Erreur lors de la sauvegarde : ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setContentSaving(s => ({ ...s, [key]: false }));
    }
  };

  // ── testimonials handlers ──
  const toggleTestimonialApproval = async (t: TestimonialRow) => {
    await approveTestimonial(t.id, !t.approved);
    setTestimonials(testimonials.map(x => x.id === t.id ? { ...x, approved: !t.approved } : x));
  };
  const removeTestimonial = async (t: TestimonialRow) => {
    await deleteTestimonial(t.id);
    setTestimonials(testimonials.filter(x => x.id !== t.id));
  };

  // ── trust_items helper ──
  const updTrustItem = (i: number, val: string) => {
    const updated = siteContent.trust_items.map((it, j) => j === i ? { ...it, label: val } : it);
    setSiteContent({ ...siteContent, trust_items: updated });
  };

  // ── FAQ helpers (définis ici pour réduire l'imbrication dans l'IIFE FAQ) ──
  const setFaqData = (next: SiteConfig['faq']) => setSiteContent(c => ({ ...c, faq: next }));
  const addFaqCat = () => setFaqData([...siteContent.faq, { cat: 'Nouvelle catégorie', items: [] }]);
  const removeFaqCat = (ci: number) => setFaqData(siteContent.faq.filter((_, i) => i !== ci));
  const updateFaqCatTitle = (ci: number, title: string) =>
    setFaqData(siteContent.faq.map((c, i) => i === ci ? { ...c, cat: title } : c));
  const addFaqItem = (ci: number) =>
    setFaqData(siteContent.faq.map((c, i) => i === ci ? { ...c, items: [...c.items, { q: '', a: '' }] } : c));
  const removeFaqItem = (ci: number, qi: number) =>
    setFaqData(siteContent.faq.map((c, i) => {
      if (i !== ci) return c;
      return { ...c, items: c.items.filter((_, j) => j !== qi) };
    }));
  const updateFaqItem = (ci: number, qi: number, patch: { q?: string; a?: string }) =>
    setFaqData(siteContent.faq.map((c, i) => {
      if (i !== ci) return c;
      return { ...c, items: c.items.map((it, j) => j === qi ? { ...it, ...patch } : it) };
    }));

  // ── filtered & paginated data ──
  const filteredReviews = useMemo(() => {
    const q = reviewSearch.toLowerCase();
    return reviews.filter(r => !q || r.author.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q));
  }, [reviews, reviewSearch]);

  const clients = useMemo(() => {
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
    return clients.filter(c => !q || c.email.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }, [clients, clientSearch]);

  const reviewPageCount  = Math.max(1, Math.ceil(filteredReviews.length  / PER_PAGE));
  const clientPageCount  = Math.max(1, Math.ceil(filteredClients.length  / PER_PAGE));
  const pagedReviews  = paginateData(filteredReviews, reviewPage, PER_PAGE).pagedData;
  const pagedClients  = paginateData(filteredClients, clientPage, PER_PAGE).pagedData;

  // ── Dashboard metrics avec helper functions ──
  const { totalRevenue, revenueThisMonth, ordersInProgress, recentOrders } = useMemo(() => 
    calculateDashboardMetrics(orders, editableProducts, reviews), 
    [orders, editableProducts, reviews]
  );
  
  const { last7Days, maxDay } = useMemo(() => 
    calculateLast7DaysData(orders), 
    [orders]
  );

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
  const adjustJekoPoints = async () => {
    if (!jekoAdjModal) return;
    const pts = Number.parseInt(jekoAdjModal.pts, 10);
    if (Number.isNaN(pts) || pts === 0) { setJekoAdjMsg({ ok: false, text: 'Nombre de points invalide' }); return; }
    setJekoAdjSaving(true);
    const memberId = jekoAdjModal.member.id;
    const shouldNotify = jekoAdjModal.notify;
    const labelMsg = jekoAdjModal.label;
    const res = await manualJekoAdjustment({ userId: memberId, points: pts, label: labelMsg });
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
          .then(() => {})
          .catch(() => {});
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
      {siteContent.trust_items.map((item, i: number) => (
        <label key={`trust-item-${i}-${item.label.slice(0, 12)}`} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="text-xs" style={{ color: TEXT2 }}>Item {i + 1}</span>
          <textarea value={item.label} rows={2} onChange={e => updTrustItem(i, e.target.value)}
            style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', resize: 'vertical', outline: 'none' }} />
        </label>
      ))}
      <button
        onClick={() => saveConfigSection('trust_items', siteContent.trust_items)}
        disabled={contentSaving.trust_items}
        style={{ alignSelf: 'flex-end', background: contentSaved.trust_items ? S_SAVE_BG : GOLD2, color: contentSaved.trust_items ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
        {getSaveButtonText(contentSaved.trust_items, contentSaving.trust_items)}
      </button>
    </div>
  );

  // Sections topbar + hero pré-déclarées hors JSX tree pour éviter le bug d'inférence TS 5.9
  const contenutTopSectionsBlock = (
    <>
      {/* ── Barre du haut ── */}
      {(() => {
        const save = async () => { await saveConfigSection('topbar', siteContent.topbar); };
        return (
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p className="text-sm font-semibold" style={{ color: GOLD }}>📢 Barre du haut</p>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="text-xs" style={{ color: TEXT2 }}>Message</span>
              <input value={siteContent.topbar.message} onChange={e => setSiteContent((c) => ({ ...c, topbar: { ...c.topbar, message: e.target.value } }))}
                style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="text-xs" style={{ color: TEXT2 }}>Téléphone</span>
              <input value={siteContent.topbar.phone} onChange={e => setSiteContent((c) => ({ ...c, topbar: { ...c.topbar, phone: e.target.value } }))}
                style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
            </label>
            <button onClick={save} disabled={contentSaving.topbar}
              style={{ alignSelf: 'flex-end', background: contentSaved.topbar ? S_SAVE_BG : GOLD2, color: contentSaved.topbar ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              {getSaveButtonText(contentSaved.topbar, contentSaving.topbar)}
            </button>
          </div>
        );
      })()}
      {/* ── Bannière Hero : déplacée dans l'onglet « Bannière Hero » de la sidebar ── */}
    </>
  );

  const heroSectionBlock = (
    <>
      {(() => {
        const save = async () => { await saveConfigSection('hero', siteContent.hero); };
        const f = siteContent.hero;
        const fields: [keyof typeof f, string, string][] = [
          ['eyebrow', 'Accroche (au-dessus du titre)', 'Ex : Nouveauté · Édition limitée'],
          ['title', 'Titre principal', 'Ex : Sublimez votre teint naturel'],
          ['titleAccent', 'Mot accentué (doré)', 'Ex : naturel'],
          ['lead', 'Sous-titre', 'Phrase courte qui donne envie de cliquer'],
          ['ctaText', 'Bouton — texte', 'Ex : Découvrir la collection'],
          ['ctaHref', 'Bouton — lien', '/boutique ou https://...'],
          ['imageAlt', "Texte alternatif (SEO / accessibilité)", "Décrivez l'image en quelques mots"],
        ];
        const hasImage = !!f.image;
        return (
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p className="text-base font-semibold" style={{ color: GOLD, marginBottom: '2px' }}>🖼 Bannière Hero</p>
                <p className="text-xs" style={{ color: TEXT3 }}>Premier élément visible de votre site — soignez l&apos;image et le message.</p>
              </div>
              <button onClick={save} disabled={contentSaving.hero}
                style={{ background: contentSaved.hero ? S_SAVE_BG : GOLD2, color: contentSaved.hero ? S_SAVE_T : BG, border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: contentSaved.hero ? 'none' : '0 4px 12px rgba(212,162,90,0.25)' }}>
                {getSaveButtonText(contentSaved.hero, contentSaving.hero)}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }} className="hero-edit-grid">
              {/* ── Colonne gauche : Image ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>● Image principale</p>
                  <div style={{ background: BG, border: `1px dashed ${BORDER}`, borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {hasImage ? (
                      <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${BORDER}`, aspectRatio: '4 / 3', background: '#000' }}>
                        <Image src={f.image} alt={f.imageAlt || 'Aperçu hero'}
                          fill style={{ objectFit: 'cover' }} unoptimized />
                        <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px' }}>
                          <a href={f.image} target="_blank" rel="noopener noreferrer"
                            style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 600, textDecoration: 'none', backdropFilter: 'blur(6px)' }}>
                            ↗ Ouvrir
                          </a>
                          <button onClick={() => setSiteContent({ ...siteContent, hero: { ...siteContent.hero, image: '' } })}
                            style={{ background: 'rgba(220,38,38,0.85)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(6px)' }}>
                            ✕ Supprimer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ aspectRatio: '4 / 3', borderRadius: '8px', border: `2px dashed ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: TEXT3, background: 'linear-gradient(135deg, rgba(212,162,90,0.04), rgba(212,162,90,0.02))' }}>
                        <span style={{ fontSize: '32px', opacity: 0.4 }}>🖼</span>
                        <span style={{ fontSize: '12px' }}>Aucune image — ajoutez-en une ci-dessous</span>
                      </div>
                    )}

                    <ImageUpload
                      value={f.image}
                      selectImage={(url: string) => setSiteContent({ ...siteContent, hero: { ...siteContent.hero, image: url } })}
                      folder="hero"
                      label={hasImage ? 'Remplacer l’image' : 'Téléverser une image'}
                      previewSize={0}
                    />
                  </div>
                </div>

                <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p className="text-xs font-semibold" style={{ color: TEXT2 }}>💡 Recommandations</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li style={{ fontSize: '11px', color: TEXT3 }}>• Format recommandé : <strong style={{ color: TEXT2 }}>1920×1280 px</strong> (ratio 3:2)</li>
                    <li style={{ fontSize: '11px', color: TEXT3 }}>• Poids max : <strong style={{ color: TEXT2 }}>500 Ko</strong> (compresser en WebP)</li>
                    <li style={{ fontSize: '11px', color: TEXT3 }}>• Sujet centré, contraste suffisant pour lire le titre</li>
                    <li style={{ fontSize: '11px', color: TEXT3 }}>• Évitez le texte intégré dans l&apos;image (mauvais SEO)</li>
                  </ul>
                </div>
              </div>

              {/* ── Colonne droite : Champs texte ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p className="text-xs font-semibold" style={{ color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>● Contenu textuel</p>
                {fields.map(([key, label, placeholder]) => {
                  const val = f[key] ?? '';
                  const long = key === 'lead';
                  const charLimit = long ? 120 : 60;
                  return (
                    <label key={String(key)} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="text-xs" style={{ color: TEXT2, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{label}</span>
                        {(key === 'title' || key === 'lead' || key === 'eyebrow') && (
                          <span style={{ color: val.length > charLimit ? '#F59E0B' : TEXT3, fontSize: '10px' }}>
                            {val.length} {long ? '/ 120' : '/ 60'}
                          </span>
                        )}
                      </span>
                      {long ? (
                        <textarea value={val} placeholder={placeholder} rows={2}
                          onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent.hero, [key]: e.target.value } })}
                          style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                      ) : (
                        <input value={val} placeholder={placeholder}
                          onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent.hero, [key]: e.target.value } })}
                          style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ── Aperçu live ── */}
            <div>
              <p className="text-xs font-semibold" style={{ color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>● Aperçu live</p>
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${BORDER}`, minHeight: '280px', background: '#0a0705' }}>
                {hasImage && (
                  <>
                    <Image src={f.image} alt="" fill
                      style={{ objectFit: 'cover', opacity: 0.55 }} unoptimized />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(13,9,6,0.85) 0%, rgba(13,9,6,0.55) 50%, rgba(13,9,6,0.25) 100%)' }} />
                  </>
                )}
                <div style={{ position: 'relative', padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '560px' }}>
                  {f.eyebrow && <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, fontWeight: 600, margin: 0 }}>{f.eyebrow}</p>}
                  <h2 style={{ fontSize: '32px', lineHeight: 1.1, color: '#F7EFE5', margin: 0, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                    {f.title}{f.titleAccent && <span style={{ color: GOLD, fontStyle: 'italic' }}> {f.titleAccent}</span>}
                  </h2>
                  {f.lead && <p style={{ fontSize: '14px', color: '#C4A574', margin: 0, lineHeight: 1.5 }}>{f.lead}</p>}
                  {f.ctaText && (
                    <span style={{ alignSelf: 'flex-start', marginTop: '8px', background: GOLD, color: BG, padding: '10px 22px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em' }}>
                      {f.ctaText} →
                    </span>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '10px', color: TEXT3, marginTop: '6px', textAlign: 'right' }}>
                Aperçu indicatif — le rendu final dépend du thème et de la taille d&apos;écran.
              </p>
            </div>
          </div>
        );
      })()}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="admin-header" style={{ position: 'sticky', top: 0, zIndex: 100, height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(13,9,6,0.90)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Ouvrir le menu"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F7EFE5', fontSize: '20px', padding: '4px 6px', lineHeight: 1, display: 'none', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
          >
            ☰
          </button>
          <span style={{ fontSize: '12px', fontWeight: 600, color: TEXT2, letterSpacing: '0.05em' }}>Tableau de bord</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {userEmail && (
            <span className="admin-email" style={{ fontSize: '11px', color: TEXT3, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: S_SAVE_T, display: 'inline-block', boxShadow: `0 0 6px ${S_SAVE_T}` }} />
              {userEmail}
            </span>
          )}
          <Link href="/" style={{ fontSize: '11px', color: TEXT2, padding: '6px 12px', borderRadius: '6px', background: SURFACE, border: `1px solid ${BORDER}`, textDecoration: 'none' }}>← Voir le site</Link>
          <button onClick={logout} style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px', background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT3, cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <aside className={`admin-sidebar${sidebarOpen ? ' admin-sidebar--open' : ''}`} style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px', background: 'linear-gradient(180deg, #1a1410 0%, #141108 100%)', borderRight: `2px solid ${GOLD_D3}`, display: 'flex', flexDirection: 'column', zIndex: 200, boxShadow: '4px 0 20px rgba(0,0,0,0.3)', transition: 'transform 0.3s ease' }}>
          {/* Logo */}
          <div style={{ height: '70px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: `1px solid ${GOLD_D3}`, gap: '12px', flexShrink: 0, background: 'rgba(212,162,90,0.08)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, ${GOLD}, #E5B366)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 4px 12px rgba(212,162,90,0.3)' }}>✦</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#F7EFE5', letterSpacing: '0.08em' }}>SD COSMETIQUE</div>
              <div style={{ fontSize: '10px', color: GOLD, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Administration</div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '18px 16px', overflowY: 'auto' }}>
            <div style={{ fontSize: '9px', color: '#8B7355', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0 12px 5px', margin: '8px 0 10px', fontWeight: 700, borderBottom: '1px solid rgba(139,115,85,0.18)' }}>PRINCIPAL</div>
            {([
              { id: 'dashboard',    label: 'Tableau de bord', icon: '▣', status: 'active' },
              { id: 'commandes',    label: 'Commandes',        icon: '◫', status: ordersInProgress > 0 ? 'alert' : 'normal' },
              { id: 'produits',     label: 'Produits',         icon: '◇', status: 'normal' },
              { id: 'avis',         label: 'Avis',             icon: '★', status: reviews.some(r => !r.verified) ? 'warning' : 'normal' },
            ] as { id: Tab; label: string; icon: string; status: AdminTabStatus }[]).map(item => {
              const active = tab === item.id;
              const bgColor = active ? 'linear-gradient(90deg, rgba(212,162,90,0.18) 0%, rgba(212,162,90,0.08) 100%)' : 'transparent';
              const borderColor = active ? GOLD : 'transparent';
              return (
                <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', textAlign: 'left', cursor: 'pointer', border: 'none', marginBottom: '4px', transition: 'all .2s ease', background: bgColor, color: active ? '#F7EFE5' : '#C4A574', fontWeight: active ? 700 : 500, borderLeft: `3px solid ${borderColor}`, boxShadow: active ? '0 2px 8px rgba(212,162,90,0.15)' : 'none' }}>
                  <span style={{ fontSize: '15px', opacity: active ? 1 : 0.8, color: active ? GOLD : '#A8956B' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.id === 'commandes' && ordersInProgress > 0 && (
                    <span style={{ fontSize: '11px', background: 'linear-gradient(135deg, #DC2626, #B91C1C)', color: '#FEE2E2', padding: '3px 8px', borderRadius: '99px', fontWeight: 700, boxShadow: '0 2px 4px rgba(220,38,38,0.3)' }}>{ordersInProgress}</span>
                  )}
                  {item.id === 'avis' && reviews.some(r => !r.verified) && (
                    <span style={{ fontSize: '11px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#FEF3C7', padding: '3px 8px', borderRadius: '99px', fontWeight: 700, boxShadow: '0 2px 4px rgba(245,158,11,0.3)' }}>{reviews.filter(r => !r.verified).length}</span>
                  )}
                </button>
              );
            })}
            
            <div style={{ fontSize: '9px', color: '#8B7355', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0 12px 5px', margin: '16px 0 10px', fontWeight: 700, borderBottom: '1px solid rgba(139,115,85,0.18)' }}>CONTENU SITE</div>
            {([
              { id: 'hero',        label: 'Bannière Hero',  desc: "Image & texte page d'accueil", icon: '🖼', status: 'normal' },
              { id: 'contenu',     label: 'Topbar & Confiance', desc: 'Annonce haut de page, garanties', icon: '📢', status: 'normal' },
              { id: 'temoignages', label: 'Témoignages',    desc: 'Avis clients long format',     icon: '💬', status: 'normal' },
              { id: 'categories',  label: 'Catégories',     desc: 'Structure du catalogue',       icon: '🗂', status: 'normal' },
              { id: 'quiz',        label: 'Quiz Teint',     desc: 'Diagnostic type de peau',      icon: '🎯', status: 'normal' },
              { id: 'faq',         label: 'FAQ',            desc: 'Questions / Réponses',         icon: '❔', status: 'normal' },
              { id: 'legal',       label: 'Pages légales',  desc: 'CGV, Confidentialité, Contact', icon: '📄', status: 'normal' },
            ] as { id: Tab; label: string; desc: string; icon: string; status: AdminTabStatus }[]).map(item => {
              const active = tab === item.id;
              const bgColor = active ? 'linear-gradient(90deg, rgba(212,162,90,0.18) 0%, rgba(212,162,90,0.08) 100%)' : 'transparent';
              const borderColor = active ? GOLD : 'transparent';
              return (
                <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '11px', padding: '9px 14px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', border: 'none', marginBottom: '3px', transition: 'all .2s ease', background: bgColor, color: active ? '#F7EFE5' : '#C4A574', borderLeft: `3px solid ${borderColor}`, boxShadow: active ? '0 2px 8px rgba(212,162,90,0.15)' : 'none' }}>
                  <span style={{ fontSize: '16px', opacity: active ? 1 : 0.75, color: active ? GOLD : '#A8956B', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '12px', fontWeight: active ? 700 : 600, lineHeight: 1.3 }}>{item.label}</span>
                    <span style={{ fontSize: '10px', color: active ? 'rgba(247,239,229,0.55)' : '#6B5A3E', fontWeight: 400, lineHeight: 1.3 }}>{item.desc}</span>
                  </span>
                </button>
              );
            })}

            <div style={{ fontSize: '9px', color: '#8B7355', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0 12px 5px', margin: '16px 0 10px', fontWeight: 700, borderBottom: '1px solid rgba(139,115,85,0.18)' }}>CLIENTS & FIDÉLITÉ</div>
            {([
              { id: 'clients',    label: 'Clients',    desc: 'Base de données clients',       icon: '👤', status: 'normal' },
              { id: 'jeko',       label: 'Fidélité',   desc: 'Points SDZ, paliers, cadeaux', icon: '✦',  status: 'premium' },
              { id: 'newsletter', label: 'Newsletter', desc: 'Abonnés & campagnes email',     icon: '✉',  status: 'normal' },
            ] as { id: Tab; label: string; desc: string; icon: string; status: AdminTabStatus }[]).map(item => {
              const active = tab === item.id;
              let bgColor = active ? 'linear-gradient(90deg, rgba(212,162,90,0.18) 0%, rgba(212,162,90,0.08) 100%)' : 'transparent';
              if (item.status === 'premium' && !active) bgColor = 'linear-gradient(90deg, rgba(212,162,90,0.08) 0%, rgba(212,162,90,0.04) 100%)';
              const borderColor = active ? GOLD : 'transparent';
              return (
                <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '11px', padding: '9px 14px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', border: 'none', marginBottom: '3px', transition: 'all .2s ease', background: bgColor, color: active ? '#F7EFE5' : '#C4A574', borderLeft: `3px solid ${borderColor}`, boxShadow: active ? '0 2px 8px rgba(212,162,90,0.15)' : 'none' }}>
                  <span style={{ fontSize: '16px', opacity: active ? 1 : 0.75, color: getTabColor(active, item.status), flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '12px', fontWeight: active ? 700 : 600, lineHeight: 1.3 }}>{item.label}</span>
                    <span style={{ fontSize: '10px', color: active ? 'rgba(247,239,229,0.55)' : '#6B5A3E', fontWeight: 400, lineHeight: 1.3 }}>{item.desc}</span>
                  </span>
                  {item.status === 'premium' && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700, #FFC107)', boxShadow: '0 0 8px rgba(255,215,0,0.5)', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}

            <div style={{ fontSize: '9px', color: '#8B7355', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0 12px 5px', margin: '16px 0 10px', fontWeight: 700, borderBottom: '1px solid rgba(139,115,85,0.18)' }}>BOUTIQUE</div>
            {([
              { id: 'marketing', label: 'Marketing',   desc: 'Bannières & sections promo', icon: '📣', status: 'important' },
              { id: 'promos',    label: 'Codes promo', desc: 'Réductions & coupons',       icon: '🎟️', status: 'normal' },
              { id: 'livraison', label: 'Livraison',   desc: 'Zones, frais, délais',       icon: '🚚', status: 'normal' },
              { id: 'branding',  label: 'Branding',    desc: 'Couleurs, logo, police',     icon: '🎨', status: 'normal' },
              { id: 'paiement',  label: 'Paiement',   desc: 'Moyens de paiement visibles', icon: '💳', status: 'normal' },
            ] as { id: Tab; label: string; desc: string; icon: string; status: AdminTabStatus }[]).map(item => {
              const active = tab === item.id;
              let bgColor = active ? 'linear-gradient(90deg, rgba(212,162,90,0.18) 0%, rgba(212,162,90,0.08) 100%)' : 'transparent';
              if (item.status === 'important' && !active) bgColor = 'linear-gradient(90deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 100%)';
              const borderColor = active ? GOLD : 'transparent';
              return (
                <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '11px', padding: '9px 14px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', border: 'none', marginBottom: '3px', transition: 'all .2s ease', background: bgColor, color: active ? '#F7EFE5' : '#C4A574', borderLeft: `3px solid ${borderColor}`, boxShadow: active ? '0 2px 8px rgba(212,162,90,0.15)' : 'none' }}>
                  <span style={{ fontSize: '16px', opacity: active ? 1 : 0.75, color: getTabColor(active, item.status), flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '12px', fontWeight: active ? 700 : 600, lineHeight: 1.3 }}>{item.label}</span>
                    <span style={{ fontSize: '10px', color: active ? 'rgba(247,239,229,0.55)' : '#6B5A3E', fontWeight: 400, lineHeight: 1.3 }}>{item.desc}</span>
                  </span>
                  {item.status === 'important' && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 8px rgba(16,185,129,0.5)', flexShrink: 0 }} />
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
              <button onClick={logout} style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(220,38,38,0.15)', border: 'none', color: '#F87171', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }} title="Déconnexion">⏻</button>
            </div>
          </div>
        </aside>

        {/* Mobile overlay — ferme la sidebar au clic */}
        {sidebarOpen && (
           
          <button
            type="button"
            aria-label="Fermer le menu"
            className="admin-overlay"
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 190, cursor: 'pointer', display: 'none', border: 'none', padding: 0 }}
          />
        )}

        {/* ── MAIN ── */}
        <main className="admin-main" style={{ flex: 1, overflowY: 'auto', padding: '32px', background: 'linear-gradient(180deg, #0F0C08 0%, #1A1410 100%)' }}>

          {/* ─── DASHBOARD TAB ─── */}
          {tab === 'dashboard' && (
            <DashboardTab
              orders={orders}
              editableProducts={editableProducts}
              reviews={reviews}
              totalRevenue={totalRevenue}
              revenueThisMonth={revenueThisMonth}
              ordersInProgress={ordersInProgress}
              recentOrders={recentOrders}
              last7Days={last7Days}
              maxDay={maxDay}
              navigate={setTab}
              openDetail={setOrderDetail}
              thStyle={thStyle}
              tdStyle={tdStyle}
            />
          )}

          {/* ─── COMMANDES TAB ─── */}
          {tab === 'commandes' && (
            <OrdersTab
              orders={orders}
              openDetail={setOrderDetail}
              changeStatus={changeStatus}
              thStyle={thStyle}
              tdStyle={tdStyle}
            />
          )}

          {/* ─── PRODUITS TAB ─── */}
          {tab === 'produits' && (
            <ProductsTab
              editableProducts={editableProducts}
              openNewModal={openNewModal}
              openEditModal={openEditModal}
              requestDelete={setConfirmDelete}
              card={card}
              inputStyle={inputStyle}
              thStyle={thStyle}
              tdStyle={tdStyle}
            />
          )}

          {/* ─── AVIS TAB ─── */}
          {tab === 'avis' && <ReviewsTab reviews={reviews} filteredReviews={filteredReviews} pagedReviews={pagedReviews} reviewPage={reviewPage} reviewPageCount={reviewPageCount} reviewSearch={reviewSearch} setReviewPage={setReviewPage} setReviewSearch={setReviewSearch} deleteReview={removeReview} toggleReview={toggleReview} />}

          {/* ─── TÉMOIGNAGES TAB ─── */}
          {tab === 'temoignages' && <TestimonialsTab testimonials={testimonials} testiSearch={testiSearch} setTestiSearch={setTestiSearch} approveTestimonial={toggleTestimonialApproval} deleteTestimonial={removeTestimonial} />}

          {/* ─── CATEGORIES TAB ─── */}
          {tab === 'categories' && <CategoriesTab categories={categories} catModal={catModal} catSaving={catSaving} setCatModal={setCatModal} setCatSaving={setCatSaving} setCategories={setCategories} />}

          {/* ─── CLIENTS TAB ─── */}
          {tab === 'clients' && <ClientsTab clients={clients} filteredClients={filteredClients} pagedClients={pagedClients} clientPage={clientPage} clientPageCount={clientPageCount} clientSearch={clientSearch} setClientPage={setClientPage} setClientSearch={setClientSearch} />}

          {/* ─── QUIZ TAB ─── */}
          {tab === 'quiz' && <QuizTab quizConcerns={quizConcerns} quizRoutines={quizRoutines} quizModal={quizModal} quizSaving={quizSaving} setQuizConcerns={setQuizConcerns} setQuizRoutines={setQuizRoutines} setQuizModal={setQuizModal} setQuizSaving={setQuizSaving} />}

          {/* ─── NEWSLETTER TAB ─── */}
          {tab === 'newsletter' && <NewsletterTab siteContent={siteContent} setSiteContent={setSiteContent} saveConfigSection={saveConfigSection} contentSaving={contentSaving} contentSaved={contentSaved} newsletterSubs={newsletterSubs} newsletterSearch={newsletterSearch} newsletterFilter={newsletterFilter} setNewsletterSearch={setNewsletterSearch} setNewsletterFilter={setNewsletterFilter} reloadNewsletter={reloadNewsletter} />}

          {/* ─── LIVRAISON TAB ─── */}
          {tab === 'livraison' && <ShippingTab siteContent={siteContent} setSiteContent={setSiteContent} saveConfigSection={saveConfigSection} contentSaving={contentSaving} contentSaved={contentSaved} />}

          {/* ─── CONTENU TAB ─── */}
          {tab === 'contenu' && <ContentTab contenutTopSectionsBlock={contenutTopSectionsBlock} trustItemsBlock={trustItemsBlock} />}

          {/* ─── LEGAL TAB ─── */}
          {tab === 'legal' && <LegalTab siteContent={siteContent} setSiteContent={setSiteContent} saveConfigSection={saveConfigSection} contentSaving={contentSaving} contentSaved={contentSaved} />}

          {/* ─── PROMOS TAB ─── */}
          {tab === 'faq' && <FaqTab siteContent={siteContent} saveConfigSection={saveConfigSection} contentSaving={contentSaving} contentSaved={contentSaved} addFaqCat={addFaqCat} addFaqItem={addFaqItem} removeFaqCat={removeFaqCat} removeFaqItem={removeFaqItem} updateFaqCatTitle={updateFaqCatTitle} updateFaqItem={updateFaqItem} />}

          {/* ─── HERO TAB ─── */}
          {tab === 'hero' && <HeroTab siteContent={siteContent} setSiteContent={setSiteContent} saveConfigSection={saveConfigSection} contentSaving={contentSaving} contentSaved={contentSaved} categories={categories} heroSectionBlock={heroSectionBlock} />}

          {/* ─── PROMOS TAB ─── */}
          {tab === 'promos' && <PromosTab siteContent={siteContent} setSiteContent={setSiteContent} saveConfigSection={saveConfigSection} contentSaving={contentSaving} contentSaved={contentSaved} />}

          {/* ─── BRANDING TAB ─── */}
          {tab === 'branding' && <BrandingTab siteContent={siteContent} setSiteContent={setSiteContent} saveConfigSection={saveConfigSection} contentSaving={contentSaving} contentSaved={contentSaved} />}

          {/* ─── PAIEMENT TAB ─── */}
          {tab === 'paiement' && <PaymentTab siteContent={siteContent} setSiteContent={setSiteContent} saveConfigSection={saveConfigSection} contentSaving={contentSaving} contentSaved={contentSaved} />}

          {/* ─── MARKETING TAB ─── */}
          {tab === 'marketing' && <MarketingTab siteContent={siteContent} setSiteContent={setSiteContent} saveConfigSection={saveConfigSection} contentSaving={contentSaving} contentSaved={contentSaved} mktSubTab={mktSubTab} setMktSubTab={setMktSubTab} />}

          {/* ─── JEKO TAB ─── */}
          {tab === 'jeko' && <JekoTab jekoSubTab={jekoSubTab} setJekoSubTab={setJekoSubTab} jekoTiersConf={jekoTiersConf} jekoRewardsConf={jekoRewardsConf} jekoMembers={jekoMembers} jekoTxns={jekoTxns} jekoStats={jekoStats} jekoSettingsEdit={jekoSettingsEdit} setJekoSettingsEdit={setJekoSettingsEdit} jekoMemberSearch={jekoMemberSearch} setJekoMemberSearch={setJekoMemberSearch} jekoMemberTxns={jekoMemberTxns} setJekoMemberTxns={setJekoMemberTxns} jekoConfSaving={jekoConfSaving} jekoConfMsg={jekoConfMsg} jekoGetTierLabel={jekoGetTierLabel} jekoSaveSettings={jekoSaveSettings} loadMemberTxns={loadMemberTxns} setJekoAdjModal={setJekoAdjModal} setJekoAdjMsg={setJekoAdjMsg} setJekoRewardEdit={setJekoRewardEdit} setJekoTierEdit={setJekoTierEdit} />}

        </main>
      </div>

      {/* ─── ORDER DETAIL MODAL ─── */}
      {orderDetail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <button type="button" onClick={() => setOrderDetail(null)} aria-label="Fermer le détail de la commande" style={{ flex: 1, background: 'rgba(0,0,0,0.7)', cursor: 'pointer', border: 'none', padding: 0 }} />
          <div style={{ width: '500px', background: SURFACE, borderLeft: `1px solid `, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  <div key={`${item.product.id}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: SURFACE2, borderRadius: '8px', padding: '10px' }}>
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
                      changeStatus(orderDetail.orderNumber, s.value);
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
      {productModal && <ProductEditModal
        key={productModal.id}
        initialProduct={productModal}
        saveDraft={saveModal}
        close={() => setProductModal(null)}
        inputStyle={inputStyle}
        SURFACE={SURFACE}
        TEXT={TEXT}
        TEXT2={TEXT2}
        TEXT3={TEXT3}
        BORDER={BORDER}
        BG={BG}
        GOLD2={GOLD2}
        SURFACE2={SURFACE2}
        BTN_BG={BTN_BG}
        S_ERR_BG={S_ERR_BG}
        S_ERR_T={S_ERR_T}
        saving={saving}
        saveError={saveError}
      />}

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
                style={{ accentColor: GOLD2 }} />{' '}
              ✉ Notifier le client par email
            </label>
            {jekoAdjMsg && <p style={{ fontSize: '12px', color: jekoAdjMsg.ok ? '#4ade80' : '#f87171', fontWeight: 600 }}>{jekoAdjMsg.text}</p>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setJekoAdjModal(null); setJekoAdjMsg(null); }}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2 }}>
                Annuler
              </button>
              <button onClick={adjustJekoPoints} disabled={jekoAdjSaving}
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
            {(['emoji', 'label', 'color', 'min', 'next'] as const).map(k => {
              const tierFieldLabel: Record<string, string> = { min: 'Points min', next: 'Points max (vide = ∞)' };
              const fieldLabel = tierFieldLabel[k] ?? (k.charAt(0).toUpperCase() + k.slice(1));
              return (
              <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '11px', color: TEXT2 }}>{fieldLabel}</span>
                <input type={k === 'min' || k === 'next' ? 'number' : 'text'} value={jekoTierEdit[k] ?? ''}
                  onChange={e => setJekoTierEdit(t => {
                    if (!t) return t;
                    let parsedVal: string | number | null;
                    if (k === 'min' || k === 'next') {
                      parsedVal = e.target.value ? Number.parseInt(e.target.value, 10) : null;
                    } else {
                      parsedVal = e.target.value;
                    }
                    return { ...t, [k]: parsedVal };
                  })}
                  style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }} />
              </label>
              );
            })}
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
                  onChange={e => setJekoRewardEdit(r => r ? { ...r, [k]: k === 'pts' ? Number.parseInt(e.target.value, 10) || 0 : e.target.value } : r)}
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
              <button onClick={() => confirmDelete && removeProduct(confirmDelete)} style={{ flex: 1, padding: '9px', borderRadius: '6px', background: S_ERR_BG, color: S_ERR_T, fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>Supprimer</button>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '9px', borderRadius: '6px', background: SURFACE2, color: TEXT2, fontSize: '13px', cursor: 'pointer', border: 'none' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Responsive admin CSS ─── */}
      <style>{`
        .admin-header { padding: 0 24px 0 calc(220px + 24px); }
        .admin-main { margin-left: 260px; }
        @media (max-width: 768px) {
          .admin-header { padding: 0 12px; }
          .admin-hamburger { display: flex !important; align-items: center; justify-content: center; }
          .admin-email { display: none !important; }
          .admin-sidebar { transform: translateX(-260px); }
          .admin-sidebar--open { transform: translateX(0) !important; }
          .admin-overlay { display: block !important; }
          .admin-main { margin-left: 0 !important; padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}

