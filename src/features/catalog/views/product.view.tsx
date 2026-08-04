'use client';

/*
 * Fiche produit. Ce fichier est desormais le composeur : il detient l'etat de
 * la fiche (image affichee, teint, quantite, onglet, ajout en cours), calcule
 * ce qui en decoule, et pose les blocs extraits en vague `split` (F-112) —
 * `product-summary.view`, `cards/purchase.card`, `product-tabs.view`,
 * `cards/sticky-purchase.card`.
 *
 * Ce qui reste ici est la galerie, en deux versions. Ce n'est pas un oubli :
 * le desktop empile ses vignettes en colonne a gauche de l'image, le mobile
 * les fait defiler sous elle. Les deux ne partagent que la source des images,
 * pas la mise en page ; il n'y a pas de composant commun a en tirer sans
 * inventer une abstraction que le rendu ne demande pas.
 */

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, Review, CATEGORIES, SKIN_TONES, SkinTone } from '@/shared/types/domain.type';
import type { ProductTrustItem, PaymentBadge, ProductToneImages } from '@/features/site-config/site-config.type';
import ProductCard from '@/features/catalog/cards/product.card';
import { useCart } from '@/features/cart/cart.store';
import { useWishlist } from '@/features/wishlist/wishlist.store';
import {
  DARK, GOLD, GOLD2, BORDER, TXT, TXT2, BG,
  toneImage, DEFAULT_TRUST, DEFAULT_PAYMENT_BADGES,
} from '@/features/catalog/product-detail.constant';
import { TRUST_ICONS, ProductWishlistIcon } from '@/features/catalog/assets/product-detail-icons';
import ProductSummary from '@/features/catalog/views/product-summary.view';
import ProductTabs, { type ProductTabId } from '@/features/catalog/views/product-tabs.view';
import PurchaseCard from '@/features/catalog/cards/purchase.card';
import StickyPurchase from '@/features/catalog/cards/sticky-purchase.card';

interface Props {
  readonly product: Product;
  readonly related: Product[];
  readonly reviews: Review[];
  /** Garanties affichées sous la sidebar (depuis site_config). */
  readonly trustItems?: ProductTrustItem[];
  /** Badges paiement (depuis site_config). */
  readonly paymentBadges?: PaymentBadge[];
  /** Images cercles teint (depuis site_config). */
  readonly toneImages?: ProductToneImages;
}

export default function ProductDetail({ product, related, reviews, trustItems, paymentBadges, toneImages }: Props) {
  const router               = useRouter();
  const { addItem }          = useCart();
  const { toggle, isInWishlist } = useWishlist();

  const trust    = trustItems    ?? DEFAULT_TRUST;
  const payments = paymentBadges ?? DEFAULT_PAYMENT_BADGES;

  /** Images teint admin-configurables — mappe marron_clair → 'marron-clair' */
  const customToneImages: Record<string, string> | undefined = toneImages ? {
    noir:           toneImages.noir          || toneImage.noir,
    marron:         toneImages.marron        || toneImage.marron,
    'marron-clair': toneImages.marron_clair  || toneImage['marron-clair'],
    clair:          toneImages.clair         || toneImage.clair,
    metisse:        toneImages.metisse       || toneImage.metisse,
  } : undefined;

  const [mainImg,      setMainImg]      = useState(0);
  const [qty,          setQty]          = useState(1);
  const [selectedTone, setSelectedTone] = useState<SkinTone>(product.skinTones[0] ?? 'noir');
  const changeQty = (q: number) => setQty(Math.max(1, q));
  const [activeTab,    setActiveTab]    = useState<ProductTabId>('description');
  const [adding,       setAdding]       = useState(false);

  /* ── Sticky CTA mobile ───────────────────────────────────────── */
  const mobilePurchaseRef                = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky]      = useState(false);
  useEffect(() => {
    const el = mobilePurchaseRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setShowSticky(!e.isIntersecting),
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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

  const categoryLabel = category?.label ?? product.category;
  const purchaseProps = {
    product,
    selectedTone,
    onSelectTone: setSelectedTone,
    qty,
    onChangeQty: changeQty,
    payments,
    handleAddToCart,
    handleBuyNow,
    adding,
    discount,
    customToneImages,
  };

  return (
    <div style={{ background: BG }}>

      {/* Breadcrumb */}
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-10 py-4">
        <nav style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 12, color: TXT2 }}>
          <Link href="/" style={{ color: TXT2, textDecoration: 'none' }}>Accueil</Link>
          <span>›</span>
          <Link href={`/categorie/${product.category}`} style={{ color: TXT2, textDecoration: 'none' }}>
            {categoryLabel}
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
              style={{ position: 'absolute', bottom: 14, right: 14, width: 44, height: 44, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
              <ProductWishlistIcon filled={inWishlist} size={16} />
            </button>
          </div>

          {/* Col 3 – Product info */}
          <ProductSummary
            product={product}
            categoryLabel={categoryLabel}
            selectedToneLabel={selectedToneInfo?.label ?? ''}
          />

          {/* Col 4 – Purchase sidebar */}
          <div style={{ alignSelf: 'start' }}>
            <PurchaseCard {...purchaseProps} />
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
              style={{ position: 'absolute', bottom: 12, right: 12, width: 44, height: 44, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
              <ProductWishlistIcon filled={inWishlist} size={15} />
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
          <ProductSummary
            product={product}
            categoryLabel={categoryLabel}
            selectedToneLabel={selectedToneInfo?.label ?? ''}
            compact
          />

          {/* Purchase card */}
          <div ref={mobilePurchaseRef}>
            <PurchaseCard {...purchaseProps} />
          </div>

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
        <ProductTabs
          product={product}
          reviews={reviews}
          keyIngredients={keyIngredients}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

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

      {/* ── Sticky CTA mobile (s'affiche quand la PurchaseCard sort du viewport) ── */}
      {showSticky && (
        <StickyPurchase product={product} adding={adding} onAddToCart={handleAddToCart} />
      )}

    </div>
  );
}
