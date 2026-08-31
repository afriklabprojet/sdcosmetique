'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  apiErrorMessage,
  deleteAddress as deleteAccountAddress,
  fetchAccountOrders,
  fetchAddresses,
  fetchLoyaltySnapshot,
  fetchStorefrontIdentity,
  joinPersonName,
  logoutStorefront,
  redeemLoyalty,
  saveAddress as persistAddress,
  type StorefrontIdentity,
  updateAccount,
} from '@/shared/api';
import { formatOrderDate } from '@/features/orders/order.store';
import { formatPrice } from '@/features/catalog/product.query';
import { useWishlist } from '@/features/wishlist/wishlist.store';
import {
  JEKO_REWARDS, JEKO_TIERS,
  type JekoTransaction, type JekoReward, type JekoConfig,
} from '@/features/loyalty/jeko.constant';
import { fetchSiteConfigSection } from '@/features/site-config/site-config.util';
import { STATUS_MAP, type Address, type NavItem } from '@/features/account/account.constant';
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

export default function AccountPage() {
  const router = useRouter();
  const [mobile, setIsMobile] = useState(false);
  const [active, setActive] = useState<NavItem>('dashboard');
  const [user, setUser] = useState<StorefrontIdentity | null>(null);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof fetchAccountOrders>>>([]);
  const [loading, setLoading] = useState(true);

  // Profil form
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '', phone: '', currentPwd: '', newPwd: '', confirmPwd: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Adresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrForm, setAddrForm] = useState<Address>({ id: '', label: 'Domicile', firstName: '', lastName: '', street: '', city: '', postalCode: '', country: 'Côte d\'Ivoire', phone: '', preferred: false });
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
  const [jekoConfig] = useState<JekoConfig>({
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
    fetchStorefrontIdentity()
      .then(async (identity) => {
        setUser(identity);
        setLoading(false);
        if (!identity) {
          setOrders([]);
          return;
        }

        setProfileForm(prev => ({
          ...prev,
          firstName: identity.prenom,
          lastName: identity.nom,
          phone: identity.telephone ?? '',
          email: identity.email,
        }));

        fetchAccountOrders().then(setOrders).catch(() => setOrders([]));
        fetchAddresses().then(setAddresses).catch(() => setAddresses([]));
        fetchLoyaltySnapshot()
          .then(({ points, entries }) => {
            setUserPoints(points);
            setJekoHistory(entries);
          })
          .catch(() => {
            setUserPoints(0);
            setJekoHistory([]);
          });
      })
      .catch(() => {
        setLoading(false);
        setUser(null);
      });
  }, []);

  const logout = async () => {
    await logoutStorefront();
    router.push('/');
  };

  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlist();

  const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
  const firstName = cap(user?.prenom ?? profileForm.firstName ?? '');
  const lastName = cap(user?.nom ?? profileForm.lastName ?? '');
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Cliente';
  const displayEmail = user?.email ?? '';
  const displayPhone = user?.telephone ?? profileForm.phone ?? '';
  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const initial = displayName[0]?.toUpperCase() ?? '?';

  const ordersForDisplay = orders.map(o => ({
    id: o.orderNumber,
    date: formatOrderDate(o.date),
    total: formatPrice(o.total),
    status: STATUS_MAP[o.status] ?? o.status,
  }));

  const saveProfileSection = async () => {
    setProfileSaving(true);
    setProfileMsg(null);

    try {
      const account = await updateAccount({
        name: joinPersonName(profileForm.firstName, profileForm.lastName),
        phone: profileForm.phone || null,
      });
      setProfileSaving(false);
      setProfileMsg({ type: 'ok', text: 'Profil mis à jour avec succès !' });
      setUser(prev => prev ? {
        ...prev,
        prenom: profileForm.firstName,
        nom: profileForm.lastName,
        telephone: account.phone,
        email: account.email,
      } : prev);
    } catch (err) {
      setProfileSaving(false);
      setProfileMsg({ type: 'err', text: apiErrorMessage(err, 'Erreur lors de la mise à jour.') });
    }
  };

  const saveAddress = async () => {
    if (!addrForm.firstName || !addrForm.street || !addrForm.city) return;
    try {
      const saved = await persistAddress(addrForm, !editingAddr);
      setAddresses(prev => {
        const filtered = editingAddr ? prev.filter(a => a.id !== editingAddr) : prev;
        return [...filtered, saved];
      });
      setShowAddrForm(false);
      setEditingAddr(null);
    } catch {
      // Address tab has no error slot; keep the form open on failure.
    }
  };

  const preferAddress = (addressId: string) => {
    setAddresses(previous => previous.map(address => ({ ...address, preferred: address.id === addressId })));
  };

  const deleteAddress = async (addressId: string) => {
    try {
      await deleteAccountAddress(addressId);
      setAddresses(previous => previous.filter(address => address.id !== addressId));
    } catch {
      // Keep the row visible if the API rejects the delete.
    }
  };

  const redeemReward = async () => {
    if (!redeemingReward) return;
    setRedeemMsg(null);
    try {
      const { points, entry } = await redeemLoyalty({
        points_delta: -redeemingReward.pts,
        description: `Récompense utilisée : ${redeemingReward.label}`,
        reference_id: redeemingReward.id,
      });
      setUserPoints(points);
      setJekoHistory(prev => [entry, ...prev]);
      setRedeemMsg({ type: 'ok', text: `✅ Récompense activée : ${redeemingReward.label} ! Un code vous sera envoyé par email.` });
    } catch (err) {
      setRedeemMsg({ type: 'err', text: apiErrorMessage(err, 'Erreur lors de la rédemption.') });
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
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: mobile ? '18px 12px 0' : '28px 40px 0' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9A8A7A', marginBottom: 20 }}>
          <Link href="/" style={{ color: '#9A8A7A', textDecoration: 'none' }}>Accueil</Link>
          <span>›</span>
          <span style={{ color: '#1A1A1A' }}>Mon compte</span>
        </div>

        <div style={{ display: 'flex', gap: mobile ? 14 : 24, alignItems: 'flex-start', flexDirection: mobile ? 'column' : 'row' }}>

          <AccountSidebar
            mobile={mobile}
            active={active}
            navigate={setActive}
            initial={initial}
            displayName={displayName}
            displayEmail={displayEmail}
            userPoints={userPoints}
            jekoConfig={jekoConfig}
            logout={logout}
          />

          <main style={{ flex: 1, minWidth: 0, width: '100%', paddingBottom: 40 }}>

            {active === 'dashboard' && (
              <DashboardTab
                mobile={mobile}
                navigate={setActive}
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
                mobile={mobile}
                displayEmail={displayEmail}
                displayPhone={displayPhone}
                firstName={firstName}
                lastName={lastName}
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                profileSaving={profileSaving}
                profileMsg={profileMsg}
                saveProfileSection={saveProfileSection}
                pwdForm={pwdForm}
                setPwdForm={setPwdForm}
                pwdMsg={pwdMsg}
                setPwdMsg={setPwdMsg}
              />
            )}

            {active === 'adresses' && (
              <AddressesTab
                mobile={mobile}
                addresses={addresses}
                addrForm={addrForm}
                setAddrForm={setAddrForm}
                showAddrForm={showAddrForm}
                setShowAddrForm={setShowAddrForm}
                editingAddr={editingAddr}
                setEditingAddr={setEditingAddr}
                saveAddress={saveAddress}
                preferAddress={preferAddress}
                deleteAddress={deleteAddress}
              />
            )}

            {active === 'paiements' && <PaymentsTab displayName={displayName} />}

            {active === 'favoris' && (
              <WishlistTab mobile={mobile} wishlistItems={wishlistItems} removeFromWishlist={removeFromWishlist} />
            )}

            {active === 'avis' && <ReviewsTab mobile={mobile} ordersForDisplay={ordersForDisplay} />}

            {active === 'points' && (
              <LoyaltyTab
                mobile={mobile}
                displayEmail={displayEmail}
                memberName={`${profileForm.firstName} ${profileForm.lastName}`.trim()}
                userPoints={userPoints}
                jekoHistory={jekoHistory}
                jekoConfig={jekoConfig}
                redeemingReward={redeemingReward}
                setRedeemingReward={setRedeemingReward}
                redeemMsg={redeemMsg}
                setRedeemMsg={setRedeemMsg}
                redeemReward={redeemReward}
              />
            )}

            {active === 'newsletter' && (
              <NewsletterTab
                user={user as unknown as { id: string; email: string }}
                newsletter={newsletter}
                setNewsletter={setNewsletter}
                newsletterSaved={newsletterSaved}
                setNewsletterSaved={setNewsletterSaved}
              />
            )}

            {active === 'parametres' && (
              <SettingsTab mobile={mobile} deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm} />
            )}
          </main>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 0,
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
              padding: mobile ? '12px' : '0 16px',
              borderRight: !mobile && i < 4 ? '1px solid #F0EBE0' : 'none',
              borderBottom: mobile && i < 3 ? '1px solid #F0EBE0' : 'none',
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
