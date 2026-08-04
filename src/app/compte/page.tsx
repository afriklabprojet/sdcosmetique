'use client';

/*
 * Espace client. Apres la vague `split` (F-111, F-082, F-103) cette page tient
 * l'etat du compte — session, commandes, profil, adresses, fidelite — et pose
 * les dix onglets extraits dans `features/account/tabs/`.
 *
 * Les setters restes en props sont ceux dont l'etat sert a la page autant qu'a
 * l'onglet : la propriete de l'etat a ete tranchee en vague `boundary`, celle-ci
 * ne fait que deplacer le rendu. Ce qui la traverse encore est note F-103.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/shared/supabase/browser.client';
import { getOrders, formatOrderDate, OrderDraft } from '@/features/orders/order.store';
import { fetchUserOrdersFromDB } from '@/features/orders/order.repository';
import { formatPrice } from '@/features/catalog/product.query';
import { useWishlist } from '@/features/wishlist/wishlist.store';
import {
  getJekoHistory, redeemJekoPoints,
  fetchJekoConfig,
  JEKO_REWARDS, JEKO_TIERS,
  type JekoTransaction, type JekoReward, type JekoConfig,
} from '@/features/loyalty/jeko.repository';
import { fetchSiteConfigSection } from '@/features/site-config/site-config.util';
import { STATUS_MAP, type Address, type NavItem } from '@/features/account/account.constant';
import { toProfileMeta } from '@/features/account/account.util';
import { LockIcon } from '@/features/account/assets/account-icons';
import AccountSidebar from '@/features/account/sidebars/account.sidebar';
import DashboardTab from '@/features/account/tabs/dashboard.tab';
import OrdersTab from '@/features/account/tabs/orders.tab';
import ProfileTab from '@/features/account/tabs/profile.tab';
import AddressesTab from '@/features/account/tabs/addresses.tab';
import PaymentsTab from '@/features/account/tabs/payments.tab';
import WishlistTab from '@/features/account/tabs/wishlist.tab';
import ReviewsTab from '@/features/account/tabs/reviews.tab';
import LoyaltyTab from '@/features/account/tabs/loyalty.tab';
import NewsletterTab from '@/features/account/tabs/newsletter.tab';
import SettingsTab from '@/features/account/tabs/settings.tab';

export default function ComptePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState<NavItem>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<OrderDraft[]>([]);
  const [loading, setLoading] = useState(true);

  // Profil form
  const [profileForm, setProfileForm] = useState({ prenom: '', nom: '', email: '', telephone: '', currentPwd: '', newPwd: '', confirmPwd: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Adresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrForm, setAddrForm] = useState<Address>({ id: '', label: 'Domicile', prenom: '', nom: '', rue: '', ville: '', code: '', pays: 'Côte d\'Ivoire', tel: '', isDefault: false });
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState<string | null>(null);

  // Newsletter
  const [newsletter, setNewsletter] = useState(true);
  const [newsletterSaved, setNewsletterSaved] = useState(false);

  // Paramètres
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Points fidélité SDZ
  const [compteHeroBg, setCompteHeroBg] = useState('/hero/generated-skincare-hero.jpg');
  const [parrainageHeroBg, setParrainageHeroBg] = useState('/hero/generated-skincare-hero-2.jpg');
  const [userPoints, setUserPoints] = useState(0);
  const [jekoHistory, setJekoHistory] = useState<JekoTransaction[]>([]);
  const [redeemingReward, setRedeemingReward] = useState<JekoReward | null>(null);
  const [redeemMsg, setRedeemMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [jekoConfig, setJekoConfig] = useState<JekoConfig>({
    settings: { points_per_1000: 10, welcome_bonus: 20 },
    tiers: JEKO_TIERS,
    rewards: JEKO_REWARDS,
  });

  useEffect(() => {
    fetchSiteConfigSection('branding').then(br => {
      if (br?.compteHeroBg) setCompteHeroBg(br.compteHeroBg);
      if (br?.parrainageHeroBg) setParrainageHeroBg(br.parrainageHeroBg);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(globalThis.window.innerWidth <= 900);
    };
    updateViewport();
    globalThis.window.addEventListener('resize', updateViewport);
    return () => globalThis.window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      setLoading(false);
      if (data.user) {
        fetchUserOrdersFromDB(data.user.id).then(setOrders).catch(() => {});

        // Charger le profil depuis la table profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('prenom, nom, telephone, newsletter, points')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setProfileForm(prev => ({
            ...prev,
            prenom: profile.prenom ?? prev.prenom,
            nom: profile.nom ?? prev.nom,
            telephone: profile.telephone ?? prev.telephone,
          }));
          if (typeof profile.newsletter === 'boolean') setNewsletter(profile.newsletter);
          if (typeof profile.points === 'number') setUserPoints(profile.points);
        }

        // Charger l'historique Jeko + config
        getJekoHistory(data.user.id).then(setJekoHistory).catch(() => {});
        fetchJekoConfig().then(setJekoConfig).catch(() => {});
      } else {
        setOrders(getOrders());
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlist();

  const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
  const prenom = cap(user?.user_metadata?.prenom ?? profileForm.prenom ?? '');
  const nom = cap(user?.user_metadata?.nom ?? profileForm.nom ?? '');
  const displayName = [prenom, nom].filter(Boolean).join(' ') || 'Cliente';
  const displayEmail = user?.email ?? '';
  const displayPhone = user?.user_metadata?.telephone ?? profileForm.telephone ?? '';
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const initial = displayName[0]?.toUpperCase() ?? '?';

  const ordersForDisplay = orders.map(o => ({
    id: o.orderNumber,
    date: formatOrderDate(o.date),
    total: formatPrice(o.total),
    status: STATUS_MAP[o.status] ?? 'Confirmée',
  }));

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    const supabase = createClient();
    const meta = toProfileMeta(profileForm);
    const updates: Record<string, unknown> = {
      ...(profileForm.email && profileForm.email !== displayEmail ? { email: profileForm.email } : {}),
      ...(Object.keys(meta).length ? { data: meta } : {}),
    };

    const { error } = await supabase.auth.updateUser(updates as Parameters<typeof supabase.auth.updateUser>[0]);

    if (!error && user) {
      if (Object.keys(meta).length) {
        await supabase.from('profiles').upsert({ id: user.id, ...meta });
      }
    }

    setProfileSaving(false);
    if (error) {
      setProfileMsg({ type: 'err', text: error.message });
      return;
    }

    setProfileMsg({ type: 'ok', text: 'Profil mis à jour avec succès !' });
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  };

  const handleSaveAddress = () => {
    if (!addrForm.prenom || !addrForm.rue || !addrForm.ville) return;

    const newAddr = { ...addrForm, id: editingAddr || Date.now().toString() };
    setAddresses(prev => {
      const filtered = editingAddr ? prev.filter(a => a.id !== editingAddr) : prev;
      const updated = addrForm.isDefault ? filtered.map(a => ({ ...a, isDefault: false })) : filtered;
      return [...updated, newAddr];
    });
    setShowAddrForm(false);
    setEditingAddr(null);
  };

  const handleSetDefaultAddress = (addressId: string) => {
    setAddresses(previous => previous.map(address => ({ ...address, isDefault: address.id === addressId })));
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddresses(previous => previous.filter(address => address.id !== addressId));
  };

  const handleRedeemReward = async () => {
    if (!redeemingReward || !user) return;
    setRedeemMsg(null);
    const result = await redeemJekoPoints(user.id, redeemingReward);

    if (result.ok) {
      setUserPoints(p => p - redeemingReward.pts);
      setJekoHistory(prev => [{
        id: Date.now().toString(),
        points: -redeemingReward.pts,
        reason: 'redemption',
        label: `Récompense utilisée : ${redeemingReward.label}`,
        reference_id: null,
        created_at: new Date().toISOString(),
      }, ...prev]);
      setRedeemMsg({ type: 'ok', text: `✅ Récompense activée : ${redeemingReward.label} ! Un code vous sera envoyé par email.` });
    } else {
      setRedeemMsg({ type: 'err', text: result.error ?? 'Erreur lors de la rédemption.' });
    }

    setRedeemingReward(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F5' }}>
        <div className="w-8 h-8 border-2 border-amber-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F5' }}>
        <div className="text-center p-8 bg-white rounded-2xl border shadow-sm" style={{ borderColor: '#EDE8E0', maxWidth: 360 }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#FDF7F0' }}>
            <LockIcon />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Connexion requise</h1>
          <p className="text-sm mb-6" style={{ color: '#9A8A7A' }}>Veuillez vous connecter pour accéder à votre espace client.</p>
          <Link href="/connexion" className="block px-6 py-3 rounded-xl text-sm font-semibold text-white text-center" style={{ background: '#3D1400' }}>
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F5F2EE', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: isMobile ? '18px 12px 0' : '28px 40px 0' }}>

        {/* ── BREADCRUMB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9A8A7A', marginBottom: 20 }}>
          <Link href="/" style={{ color: '#9A8A7A', textDecoration: 'none' }}>Accueil</Link>
          <span>›</span>
          <span style={{ color: '#1A1A1A' }}>Mon compte</span>
        </div>

        <div style={{ display: 'flex', gap: isMobile ? 14 : 24, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>

          <AccountSidebar
            isMobile={isMobile}
            active={active}
            onNavigate={setActive}
            initial={initial}
            displayName={displayName}
            displayEmail={displayEmail}
            userPoints={userPoints}
            jekoConfig={jekoConfig}
            onLogout={handleLogout}
          />

          {/* ════════════════════════════════
              MAIN CONTENT
          ════════════════════════════════ */}
          <main style={{ flex: 1, minWidth: 0, width: '100%', paddingBottom: 40 }}>

            {active === 'dashboard' && (
              <DashboardTab
                isMobile={isMobile}
                onNavigate={setActive}
                ordersForDisplay={ordersForDisplay}
                displayName={displayName}
                displayEmail={displayEmail}
                displayPhone={displayPhone}
                createdAt={createdAt}
                wishlistItems={wishlistItems}
                userPoints={userPoints}
                jekoConfig={jekoConfig}
                compteHeroBg={compteHeroBg}
                parrainageHeroBg={parrainageHeroBg}
              />
            )}

            {active === 'commandes' && <OrdersTab ordersForDisplay={ordersForDisplay} />}

            {active === 'profil' && (
              <ProfileTab
                isMobile={isMobile}
                displayEmail={displayEmail}
                displayPhone={displayPhone}
                prenom={prenom}
                nom={nom}
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                profileSaving={profileSaving}
                profileMsg={profileMsg}
                handleProfileSave={handleProfileSave}
                pwdForm={pwdForm}
                setPwdForm={setPwdForm}
                pwdMsg={pwdMsg}
                setPwdMsg={setPwdMsg}
              />
            )}

            {active === 'adresses' && (
              <AddressesTab
                isMobile={isMobile}
                addresses={addresses}
                addrForm={addrForm}
                setAddrForm={setAddrForm}
                showAddrForm={showAddrForm}
                setShowAddrForm={setShowAddrForm}
                editingAddr={editingAddr}
                setEditingAddr={setEditingAddr}
                handleSaveAddress={handleSaveAddress}
                handleSetDefaultAddress={handleSetDefaultAddress}
                handleDeleteAddress={handleDeleteAddress}
              />
            )}

            {active === 'paiements' && <PaymentsTab displayName={displayName} />}

            {active === 'favoris' && (
              <WishlistTab isMobile={isMobile} wishlistItems={wishlistItems} removeFromWishlist={removeFromWishlist} />
            )}

            {active === 'avis' && <ReviewsTab isMobile={isMobile} ordersForDisplay={ordersForDisplay} />}

            {active === 'points' && (
              <LoyaltyTab
                isMobile={isMobile}
                displayEmail={displayEmail}
                memberName={`${profileForm.prenom} ${profileForm.nom}`.trim()}
                userPoints={userPoints}
                jekoHistory={jekoHistory}
                jekoConfig={jekoConfig}
                redeemingReward={redeemingReward}
                setRedeemingReward={setRedeemingReward}
                redeemMsg={redeemMsg}
                setRedeemMsg={setRedeemMsg}
                handleRedeemReward={handleRedeemReward}
              />
            )}

            {active === 'newsletter' && (
              <NewsletterTab
                user={user}
                newsletter={newsletter}
                setNewsletter={setNewsletter}
                newsletterSaved={newsletterSaved}
                setNewsletterSaved={setNewsletterSaved}
              />
            )}

            {active === 'parametres' && (
              <SettingsTab isMobile={isMobile} deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm} />
            )}
          </main>
        </div>

        {/* ── TRUST FOOTER ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 0,
          background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0',
          margin: '24px 0 0', padding: '20px 0',
        }}>
          {[
            { icon: '🚚', title: 'Livraison rapide', sub: 'en 24h - 48h' },
            { icon: '✅', title: 'Produits authentiques', sub: '100% certifiés' },
            { icon: '🔒', title: 'Paiement sécurisé', sub: 'par plusieurs moyens' },
            { icon: '↩️', title: 'Satisfait ou remboursé', sub: 'sous 7 jours' },
            { icon: '💬', title: 'Service client disponible', sub: '7/7' },
          ].map((t, i) => (
            <div key={t.title} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              padding: isMobile ? '12px' : '0 16px',
              borderRight: !isMobile && i < 4 ? '1px solid #F0EBE0' : 'none',
              borderBottom: isMobile && i < 3 ? '1px solid #F0EBE0' : 'none',
            }}>
              <span style={{ fontSize: 24, marginBottom: 6 }}>{t.icon}</span>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{t.title}</p>
              <p style={{ fontSize: 10, color: '#9A8A7A', marginTop: 2 }}>{t.sub}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
