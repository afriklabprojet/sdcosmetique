'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/products';
import { Product, Review, CATEGORIES, SKIN_TONES, SkinTone } from '@/types';
import type { ProductTrustItem, PaymentBadge } from '@/lib/site-config';
import ProductCard from '@/components/ui/ProductCard';
import StarRating from '@/components/ui/StarRating';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const DARK   = '#3D1400';
const GOLD   = '#8F5922';
const GOLD2  = '#C8974A';
const BORDER = '#EDE8E0';
const TXT    = '#1A1A1A';
const TXT2   = '#9A8A7A';
const TXT3   = '#7A6A5A';
const BG     = '#F8F4EF';

const toneColor: Record<string, string> = {
  noir:           '#2C1810',
  marron:         '#7B4A2D',
  'marron-clair': '#C68642',
  clair:          '#F0CEAA',
  metisse:        '#A0714F',
};

const toneImage: Record<string, string> = {
  noir:           '/hero/skintone-noir.jpg',
  marron:         '/hero/skintone-marron.jpg',
  'marron-clair': '/hero/skintone-marron-clair.jpg',
  clair:          '/hero/skintone-clair.jpg',
  metisse:        '/hero/skintone-metisse.jpg',
};

interface Props {
  readonly product: Product;
  readonly related: Product[];
  readonly reviews: Review[];
  /** Garanties affichées sous la sidebar (depuis site_config). */
  readonly trustItems?: ProductTrustItem[];
  /** Badges paiement (depuis site_config). */
  readonly paymentBadges?: PaymentBadge[];
}

function BenefitIcon({ i }: { readonly i: number }) {
  const c = {
    width: 15, height: 15, viewBox: '0 0 24 24',
    fill: 'none' as const, stroke: GOLD2, strokeWidth: '2',
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  const icons = [
    <svg key="sun"  {...c}><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>,
    <svg key="star" {...c}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/></svg>,
    <svg key="drop" {...c}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
    <svg key="leaf" {...c}><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z"/><line x1="16" y1="8" x2="2" y2="22"/></svg>,
  ];
  return <>{icons[i % 4]}</>;
}

function PayBadge({ label, bg, text = 'white' }: { readonly label: string; readonly bg: string; readonly text?: string }) {
  return (
    <div style={{ width: 44, height: 28, borderRadius: 5, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 3px' }}>
      <span style={{ fontSize: '6px', fontWeight: 900, color: text, textAlign: 'center', lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
        {label}
      </span>
    </div>
  );
}

const TRUST_ICONS: Record<ProductTrustItem['icon'], React.ReactNode> = {
  truck:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  shield: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  leaf:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12"/><path d="M12 12C12 7 5 5 5 2c0 0 7 1 12 7 3 3 0 9-5 3z"/></svg>,
  rotate: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>,
};

const DEFAULT_TRUST: ProductTrustItem[] = [
  { icon: 'truck',  label: 'Livraison rapide',       sub: 'en 24h - 48h' },
  { icon: 'shield', label: 'Produits authentiques',  sub: '100% certifiés' },
  { icon: 'leaf',   label: 'Ingrédients naturels',   sub: 'et de qualité' },
  { icon: 'rotate', label: 'Satisfait ou remboursé', sub: 'sous 7 jours' },
];

const DEFAULT_PAYMENT_BADGES: PaymentBadge[] = [
  { label: 'Orange Money',   bg: '#FF6600' },
  { label: 'Wave',           bg: '#0066CC' },
  { label: 'MTN MoMo',       bg: '#FFCC00', text: '#1A1A1A' },
  { label: 'Moov Money',     bg: '#00A651' },
  { label: 'Carte Bancaire', bg: '#1A1F71' },
];

// ─── TonePicker (module-level) ──────────────────────────────────────────────
interface TonePickerProps {
  readonly skinTones: string[];
  readonly selectedTone: string;
  readonly onSelect: (t: string) => void;
  readonly size?: number;
}
function TonePicker({ skinTones, selectedTone, onSelect, size = 40 }: TonePickerProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {skinTones.map(tone => {
        const info     = SKIN_TONES.find(s => s.id === tone);
        const isActive = selectedTone === tone;
        return (
          <button key={tone} onClick={() => onSelect(tone)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ width: size, height: size, borderRadius: '50%', background: toneColor[tone] ?? '#888', border: `2px solid ${isActive ? GOLD : BORDER}`, position: 'relative', overflow: 'hidden', boxShadow: isActive ? `0 0 0 2px white, 0 0 0 4px ${GOLD}` : 'none', transition: 'box-shadow .2s' }}>
              {toneImage[tone] && (
                <Image
                  src={toneImage[tone]}
                  alt={info?.label ?? tone}
                  fill
                  sizes="48px"
                  style={{ objectFit: 'cover' }}
                />
              )}
              {isActive && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(61,20,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </div>
            <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 400, color: isActive ? DARK : TXT2, textAlign: 'center', lineHeight: 1.2 }}>
              {info?.label ?? tone}
            </span>
          </button>
        );
      })}
    </div>
  );
}


// ─── PurchaseCard (module-level) ─────────────────────────────────────────────
interface PurchaseCardProps {
  readonly product: import('@/types').Product;
  readonly selectedTone: string;
  readonly setSelectedTone: (t: import('@/types').SkinTone) => void;
  readonly qty: number;
  readonly setQty: (q: number) => void;
  readonly payments: import('@/lib/site-config').PaymentBadge[];
  readonly handleAddToCart: () => void;
  readonly handleBuyNow: () => void;
  readonly adding: boolean;
  readonly discount: number | null;
}
function PurchaseCard({ product, selectedTone, setSelectedTone, qty, setQty, payments, handleAddToCart, handleBuyNow, adding, discount }: PurchaseCardProps) {
  return (
    <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '20px 18px' }}>

      {/* Prix */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: TXT, fontFamily: 'Georgia,serif' }}>
          {product.price.toLocaleString('fr-FR')}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: TXT2 }}>FCFA</span>
        {product.originalPrice && (
          <span style={{ fontSize: 13, textDecoration: 'line-through', color: TXT2, marginLeft: 4 }}>
            {formatPrice(product.originalPrice)}
          </span>
        )}
        {discount && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#C0392B', background: '#FEE2E2', padding: '2px 6px', borderRadius: 3, marginLeft: 4 }}>
            -{discount}%
          </span>
        )}
      </div>

      {/* Sélecteur de teint */}
      {product.skinTones.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: TXT, marginBottom: 12 }}>
            Votre teint
          </p>
          <TonePicker skinTones={product.skinTones} selectedTone={selectedTone} onSelect={t => setSelectedTone(t as import('@/types').SkinTone)} />
        </div>
      )}

      {/* Quantité */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: TXT, margin: 0 }}>Qté</p>
        <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${BORDER}`, borderRadius: 4, overflow: 'hidden' }}>
          <button onClick={() => setQty(Math.max(1, qty - 1))}
            style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: TXT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
          <span style={{ minWidth: 28, textAlign: 'center', fontSize: 14, fontWeight: 600, color: TXT }}>{qty}</span>
          <button onClick={() => setQty(qty + 1)}
            style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: TXT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
      </div>

      {/* Bouton Ajouter au panier */}
      <button onClick={handleAddToCart} disabled={adding}
        style={{ width: '100%', padding: '14px 0', background: DARK, color: 'white', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: adding ? 'wait' : 'pointer', marginBottom: 10, opacity: adding ? 0.8 : 1, transition: 'opacity .2s' }}>
        {adding ? '✓ Ajouté !' : 'Ajouter au panier'}
      </button>

      {/* Bouton Acheter maintenant */}
      <button onClick={handleBuyNow}
        style={{ width: '100%', padding: '13px 0', background: 'transparent', color: DARK, border: `2px solid ${DARK}`, borderRadius: 4, fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 18 }}>
        Acheter maintenant
      </button>

      {/* Badges paiement */}
      {payments.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: TXT2, marginBottom: 8, textAlign: 'center' }}>
            Paiement sécurisé
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {payments.map((p) => <PayBadge key={p.label} label={p.label} bg={p.bg} text={p.text} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetail({ product, related, reviews, trustItems, paymentBadges }: Props) {
  const router               = useRouter();
  const { addItem }          = useCart();
  const { toggle, isInWishlist } = useWishlist();

  const trust    = trustItems    ?? DEFAULT_TRUST;
  const payments = paymentBadges ?? DEFAULT_PAYMENT_BADGES;

  const [mainImg,      setMainImg]      = useState(0);
  const [qty,          setQty]          = useState(1);
  const [selectedTone, setSelectedTone] = useState<SkinTone>(product.skinTones[0] ?? 'noir');
  const [activeTab,    setActiveTab]    = useState<'description' | 'usage' | 'ingredients' | 'reviews'>('description');
  const [adding,       setAdding]       = useState(false);

  const category         = CATEGORIES.find(c => c.id === product.category);
  const inWishlist       = isInWishlist(product.id);
  const discount         = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;
  const selectedToneInfo = SKIN_TONES.find(s => s.id === selectedTone);
  const keyIngredients   = product.ingredients
    ? product.ingredients.split(',').slice(0, 6).map((s: string) => s.trim()).filter(Boolean)
    : product.benefits.slice(0, 4);

  const handleAddToCart = () => {
    setAdding(true);
    for (let i = 0; i < qty; i++) addItem(product);
    setTimeout(() => setAdding(false), 1500);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    router.push('/checkout');
  };

  // TonePicker défini au niveau module (voir ci-dessus)

  // PurchaseCard défini au niveau module (voir ci-dessus)

  return (
    <div style={{ background: BG }}>

      {/* Breadcrumb */}
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-10 py-4">
        <nav style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 12, color: TXT2 }}>
          <Link href="/" style={{ color: TXT2, textDecoration: 'none' }}>Accueil</Link>
          <span>›</span>
          <Link href={`/categorie/${product.category}`} style={{ color: TXT2, textDecoration: 'none' }}>
            {category?.label ?? product.category}
          </Link>
          <span>›</span>
          <span style={{ color: TXT }}>{product.name}</span>
        </nav>
      </div>

      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-10 pb-10">

        {/* ── Desktop 4-col ─────────────────────────────────────────── */}
        <div className="hidden lg:grid gap-5" style={{ gridTemplateColumns: '88px 1fr 1fr 268px' }}>

          {/* Col 1 – Thumbnails */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {product.images.map((img, i) => (
              <button key={img} onClick={() => setMainImg(i)}
                style={{ width: 88, height: 88, borderRadius: 4, overflow: 'hidden', border: `2px solid ${mainImg === i ? GOLD : BORDER}`, opacity: mainImg === i ? 1 : 0.65, cursor: 'pointer', background: 'white', padding: 0, flexShrink: 0, position: 'relative', transition: 'border-color .2s,opacity .2s' }}>
                <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="88px" style={{ objectFit: 'cover' }} />
              </button>
            ))}
          </div>

          {/* Col 2 – Main image */}
          <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', background: 'white', aspectRatio: '1/1' }}>
            <Image src={product.images[mainImg]} alt={product.name} fill priority
              sizes="(max-width:1280px) 35vw,450px"
              style={{ objectFit: 'cover' }} />
            {product.isBestseller && (
              <div style={{ position: 'absolute', top: 18, right: 18, width: 72, height: 72, borderRadius: '50%', background: DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.25)' }}>
                <span style={{ fontSize: 7.5, fontWeight: 900, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1 }}>BEST</span>
                <span style={{ fontSize: 7.5, fontWeight: 900, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.4 }}>SELLER</span>
                <span style={{ fontSize: 11, color: GOLD2 }}>★★★</span>
              </div>
            )}
            {discount && (
              <div style={{ position: 'absolute', top: 14, left: 14, padding: '4px 8px', background: '#C0392B', color: 'white', fontSize: 11, fontWeight: 700, borderRadius: 3 }}>
                -{discount}%
              </div>
            )}
            <button onClick={() => toggle(product)}
              style={{ position: 'absolute', bottom: 14, right: 14, width: 38, height: 38, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={inWishlist ? GOLD : 'none'} stroke={inWishlist ? GOLD : TXT2} strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {/* Col 3 – Product info */}
          <div style={{ paddingTop: 4 }}>
            <span style={{ display: 'inline-block', padding: '4px 12px', background: GOLD, color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: 2, marginBottom: 12 }}>
              {category?.label ?? product.category}
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: TXT, fontFamily: 'Georgia,serif', lineHeight: 1.2, marginBottom: 4 }}>
              {product.name}
            </h1>
            <p style={{ fontSize: 20, fontWeight: 700, color: GOLD2, fontFamily: 'Georgia,serif', marginBottom: 12 }}>
              Teint {selectedToneInfo?.label ?? ''}
            </p>
            <div style={{ marginBottom: 16 }}>
              <StarRating rating={product.rating} count={product.reviewCount} size={15} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: TXT, fontFamily: 'Georgia,serif' }}>
                {product.price.toLocaleString('fr-FR')}
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: TXT2 }}>FCFA</span>
              {product.originalPrice && (
                <span style={{ fontSize: 14, textDecoration: 'line-through', color: TXT2, marginLeft: 4 }}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: TXT3, lineHeight: 1.65, marginBottom: 20 }}>
              {product.shortDescription}
            </p>
            {product.benefits.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: TXT, marginBottom: 12 }}>
                  Bienfaits
                </p>
                {product.benefits.map((b, i) => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: '#FDF4E8', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BenefitIcon i={i} />
                    </div>
                    <span style={{ fontSize: 13, color: TXT }}>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Col 4 – Purchase sidebar */}
          <div style={{ alignSelf: 'start' }}>
            <PurchaseCard
              product={product}
              selectedTone={selectedTone}
              setSelectedTone={setSelectedTone}
              qty={qty}
              setQty={setQty}
              payments={payments}
              handleAddToCart={handleAddToCart}
              handleBuyNow={handleBuyNow}
              adding={adding}
              discount={discount}
            />
          </div>

        </div>{/* end desktop */}

        {/* ── Mobile ─────────────────────────────────────────────────── */}
        <div className="lg:hidden flex flex-col gap-5">

          {/* Main image */}
          <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', background: 'white', aspectRatio: '1/1' }}>
            <Image src={product.images[mainImg]} alt={product.name} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
            {product.isBestseller && (
              <div style={{ position: 'absolute', top: 14, right: 14, width: 64, height: 64, borderRadius: '50%', background: DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 7, fontWeight: 900, color: 'white', lineHeight: 1 }}>BEST</span>
                <span style={{ fontSize: 7, fontWeight: 900, color: 'white', lineHeight: 1.4 }}>SELLER</span>
                <span style={{ fontSize: 10, color: GOLD2 }}>★★★</span>
              </div>
            )}
            <button onClick={() => toggle(product)}
              style={{ position: 'absolute', bottom: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill={inWishlist ? GOLD : 'none'} stroke={inWishlist ? GOLD : TXT2} strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
              {product.images.map((img, i) => (
                <button key={img} onClick={() => setMainImg(i)}
                  style={{ width: 72, height: 72, borderRadius: 4, overflow: 'hidden', flexShrink: 0, border: `2px solid ${mainImg === i ? GOLD : BORDER}`, opacity: mainImg === i ? 1 : 0.65, cursor: 'pointer', background: 'white', padding: 0, position: 'relative' }}>
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="72px" style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* Info */}
          <div>
            <span style={{ display: 'inline-block', padding: '4px 10px', background: GOLD, color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: 2, marginBottom: 10 }}>
              {category?.label ?? product.category}
            </span>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: TXT, fontFamily: 'Georgia,serif', lineHeight: 1.2, marginBottom: 4 }}>
              {product.name}
            </h1>
            <p style={{ fontSize: 17, fontWeight: 700, color: GOLD2, fontFamily: 'Georgia,serif', marginBottom: 10 }}>
              Teint {selectedToneInfo?.label ?? ''}
            </p>
            <div style={{ marginBottom: 12 }}>
              <StarRating rating={product.rating} count={product.reviewCount} size={14} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: TXT, fontFamily: 'Georgia,serif' }}>
                {product.price.toLocaleString('fr-FR')}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: TXT2 }}>FCFA</span>
              {product.originalPrice && (
                <span style={{ fontSize: 13, textDecoration: 'line-through', color: TXT2 }}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: TXT3, lineHeight: 1.65, marginBottom: 16 }}>
              {product.shortDescription}
            </p>
            {product.benefits.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: TXT, marginBottom: 10 }}>
                  Bienfaits
                </p>
                {product.benefits.map((b, i) => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: '#FDF4E8', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BenefitIcon i={i} />
                    </div>
                    <span style={{ fontSize: 13, color: TXT }}>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Purchase card */}
          <PurchaseCard
              product={product}
              selectedTone={selectedTone}
              setSelectedTone={setSelectedTone}
              qty={qty}
              setQty={setQty}
              payments={payments}
              handleAddToCart={handleAddToCart}
              handleBuyNow={handleBuyNow}
              adding={adding}
              discount={discount}
            />

        </div>{/* end mobile */}

        {/* ── Trust bar ──────────────────────────────────────────────── */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4"
          style={{ border: `1px solid ${BORDER}`, borderRadius: 6, background: 'white', marginTop: 28, overflow: 'hidden' }}>
          {trust.map((item, i) => (
            <div key={item.label}
              className={i < trust.length - 1 ? 'sm:border-r' : ''}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', borderColor: BORDER }}>
              <div style={{ flexShrink: 0 }}>{TRUST_ICONS[item.icon]}</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: TXT, lineHeight: 1.3 }}>{item.label}</p>
                <p style={{ fontSize: 12, color: TXT2 }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs + side panels (Ingrédients clés / Résultats) ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ marginTop: 28 }}>

          {/* Left : tabs + tab content */}
          <div className="lg:col-span-6" style={{ border: `1px solid ${BORDER}`, borderRadius: 6, background: 'white', padding: '0 22px 22px' }}>
            <div style={{ display: 'flex', gap: 24, borderBottom: `2px solid ${BORDER}` }}>
              {([
                { id: 'description', label: 'Description' },
                { id: 'usage',       label: "Conseils d'utilisation" },
                { id: 'ingredients', label: 'Ingrédients' },
                { id: 'reviews',     label: `Avis clients (${reviews.length || product.reviewCount})` },
              ] as const).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ padding: '16px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: activeTab === tab.id ? GOLD : TXT2, borderBottom: `2px solid ${activeTab === tab.id ? GOLD : 'transparent'}`, marginBottom: -2, whiteSpace: 'nowrap', transition: 'color .2s' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ paddingTop: 20 }}>
              {activeTab === 'description' && (
                <p style={{ fontSize: 13, color: TXT3, lineHeight: 1.75 }}>{product.description}</p>
              )}

              {activeTab === 'usage' && (
                <p style={{ fontSize: 13, color: TXT3, lineHeight: 1.75 }}>{product.usage}</p>
              )}

              {activeTab === 'ingredients' && (
                <p style={{ fontSize: 12, color: TXT3, lineHeight: 1.8, fontFamily: 'monospace' }}>
                  {product.ingredients ?? 'Liste des ingrédients non disponible.'}
                </p>
              )}

              {activeTab === 'reviews' && (
                reviews.length === 0
                  ? <p style={{ fontSize: 14, color: TXT2 }}>Aucun avis pour ce produit.</p>
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {reviews.map(review => (
                        <div key={review.id} style={{ paddingBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: TXT, fontFamily: 'Georgia,serif' }}>{review.author}</span>
                                {review.verified && (
                                  <span style={{ padding: '2px 8px', background: '#FDF4E8', color: GOLD, fontSize: 10, fontWeight: 600, borderRadius: 2 }}>
                                    Achat vérifié
                                  </span>
                                )}
                              </div>
                              <StarRating rating={review.rating} showCount={false} size={12} />
                            </div>
                            <span style={{ fontSize: 12, color: TXT2 }}>
                              {new Date(review.date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: TXT3, lineHeight: 1.7 }}>{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )
              )}
            </div>
          </div>

          {/* Middle : Ingrédients clés */}
          <div className="lg:col-span-3" style={{ border: `1px solid ${BORDER}`, borderRadius: 6, background: BG, padding: '20px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, marginBottom: 16 }}>
              Ingrédients clés
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {keyIngredients.map((ing) => (
                <span key={ing} style={{ padding: '6px 14px', background: 'white', border: `1px solid ${BORDER}`, borderRadius: 20, fontSize: 12, fontWeight: 500, color: GOLD }}>
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Right : Résultats avec image */}
          <div className="lg:col-span-3" style={{ border: `1px solid ${BORDER}`, borderRadius: 6, background: BG, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
            <div style={{ position: 'relative', width: '45%', flexShrink: 0, background: '#E8DFD0' }}>
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="180px"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : null}
            </div>
            <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: TXT, fontFamily: 'Georgia,serif', lineHeight: 1.2, marginBottom: 8 }}>
                {(product.resultsTitle ?? "Résultats visibles dès 7 jours d'utilisation")
                  .split(/\n|<br\s*\/?>/i)
                  .flatMap((line, i, arr) => i < arr.length - 1 ? [line, <br key={line} />] : [line])}
              </p>
              <p style={{ fontSize: 12, color: TXT3, lineHeight: 1.5 }}>
                {product.resultsSubtitle ?? 'Peau plus lumineuse, lisse et unifiée.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Related products ───────────────────────────────────────── */}
        {related.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: TXT, fontFamily: 'Georgia,serif', marginBottom: 24 }}>
              Plus de soins {category?.label.toLowerCase() ?? 'similaires'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
