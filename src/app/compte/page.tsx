'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { getOrders, formatOrderDate, OrderDraft } from '@/lib/orders';
import { fetchUserOrdersFromDB } from '@/lib/orders-db';
import { formatPrice } from '@/lib/products';
import { useWishlist } from '@/context/WishlistContext';
import {
  getJekoHistory, redeemJekoPoints, getJekoTierFromList,
  fetchJekoConfig, formatJekoDate, reasonLabel,
  JEKO_REWARDS, JEKO_TIERS,
  type JekoTransaction, type JekoReward, type JekoConfig,
} from '@/lib/jeko';
import { DEFAULT_SITE_CONFIG } from '@/lib/config/defaults';
import { fetchSiteConfigSection } from '@/lib/config/utilities';

function jekoNextLabel(currentLabel: string, tiers: typeof JEKO_TIERS): string {
  const idx = tiers.findIndex(t => t.label === currentLabel);
  return idx >= 0 && idx < tiers.length - 1 ? tiers[idx + 1].label : '';
}

function getTierGradient(label: string): string {
  switch (label) {
    case 'Diamant':
      return 'linear-gradient(135deg,#0c1a2e 0%,#1a3a5c 40%,#0ea5e9 100%)';
    case 'Platine':
      return 'linear-gradient(135deg,#1a0a2e 0%,#4a1a7a 50%,#9333EA 100%)';
    case 'Gold':
      return 'linear-gradient(135deg,#3D1400 0%,#6B3D14 50%,#C8974A 100%)';
    case 'Argent':
      return 'linear-gradient(135deg,#1a1a1a 0%,#3a3a3a 50%,#6B7280 100%)';
    default:
      return 'linear-gradient(135deg,#2a1400 0%,#5a2d0c 50%,#CD7F32 100%)';
  }
}

function getTransactionIcon(reason: JekoTransaction['reason']): string {
  switch (reason) {
    case 'purchase':
      return '🛍️';
    case 'welcome':
      return '🎉';
    case 'referral':
      return '👥';
    case 'redemption':
      return '🎁';
    default:
      return '✏️';
  }
}

function toProfileMeta(form: { prenom: string; nom: string; telephone: string }): Record<string, string> {
  return {
    ...(form.prenom ? { prenom: form.prenom } : {}),
    ...(form.nom ? { nom: form.nom } : {}),
    ...(form.telephone ? { telephone: form.telephone } : {}),
  };
}

type NavItem = 'dashboard' | 'commandes' | 'adresses' | 'paiements' | 'favoris' | 'avis' | 'profil' | 'points' | 'newsletter' | 'parametres';

const NAV_ITEMS: { id: NavItem; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'dashboard',   label: 'Tableau de bord', icon: <HomeIcon /> },
  { id: 'commandes',   label: 'Mes commandes',   icon: <BoxIcon /> },
  { id: 'adresses',    label: 'Mes adresses',     icon: <PinIcon /> },
  { id: 'paiements',   label: 'Mes paiements',    icon: <CardIcon /> },
  { id: 'favoris',     label: 'Mes favoris',      icon: <HeartIcon /> },
  { id: 'avis',        label: 'Mes avis',         icon: <StarIcon /> },
  { id: 'profil',      label: 'Mon profil',       icon: <UserIcon /> },
  { id: 'points',      label: 'Mes points',       icon: <GiftIcon /> },
  { id: 'newsletter',  label: 'Newsletter',       icon: <MailIcon /> },
  { id: 'parametres',  label: 'Paramètres',       icon: <SettingsIcon /> },
];

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
  const [addresses, setAddresses] = useState<Array<{ id: string; label: string; prenom: string; nom: string; rue: string; ville: string; code: string; pays: string; tel: string; isDefault: boolean }>>([]);
  const [addrForm, setAddrForm] = useState({ id: '', label: 'Domicile', prenom: '', nom: '', rue: '', ville: '', code: '', pays: 'Côte d\'Ivoire', tel: '', isDefault: false });
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

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    Livrée:   { bg: '#ECFDF5', color: '#059669', label: 'Livrée' },
    Confirmée:{ bg: '#ECFDF5', color: '#059669', label: 'Confirmée' },
    'En cours':{ bg: '#FFF7ED', color: '#EA580C', label: 'En cours' },
    Expédiée: { bg: '#EFF6FF', color: '#2563EB', label: 'Expédiée' },
    Annulée:  { bg: '#FEF2F2', color: '#DC2626', label: 'Annulée' },
  };

  const statusMap: Record<string, string> = {
    confirmed: 'Confirmée',
    processing: 'En cours',
    shipped: 'Expédiée',
    delivered: 'Livrée',
  };
  const ordersForDisplay = orders.map(o => ({
    id: o.orderNumber,
    date: formatOrderDate(o.date),
    total: formatPrice(o.total),
    status: statusMap[o.status] ?? 'Confirmée',
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

          {/* ════════════════════════════════
              LEFT SIDEBAR
          ════════════════════════════════ */}
          <aside style={{ width: isMobile ? '100%' : 240, flexShrink: 0 }}>
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EDE8E0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(61,20,0,.05)' }}>

              {/* Avatar + nom */}
              <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #F5F0E8', background: 'linear-gradient(135deg,#FAF8F5 0%,#F5F0E8 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#3D1400,#6B3D14)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, boxShadow: '0 2px 8px rgba(61,20,0,.25)',
                  }}>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{initial}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
                    <p style={{ fontSize: 10, color: '#9A8A7A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayEmail}</p>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4,
                      background: getJekoTierFromList(userPoints, jekoConfig.tiers).bg, borderRadius: 99, padding: '2px 8px',
                      fontSize: 10, fontWeight: 700, color: getJekoTierFromList(userPoints, jekoConfig.tiers).textColor,
                    }}>{getJekoTierFromList(userPoints, jekoConfig.tiers).emoji}{' '}Membre {getJekoTierFromList(userPoints, jekoConfig.tiers).label}</span>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav style={{ padding: '8px' }}>
                {NAV_ITEMS.map(item => {
                  const isActive = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActive(item.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', textAlign: 'left', border: 'none', cursor: 'pointer',
                        background: isActive ? '#3D1400' : 'transparent',
                        color: isActive ? '#fff' : '#4A3828',
                        fontSize: 13, fontWeight: isActive ? 600 : 400,
                        borderRadius: 10,
                        transition: 'all .15s',
                        marginBottom: 2,
                      }}
                    >
                      <span style={{ opacity: isActive ? 1 : 0.55, display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                          background: isActive ? 'rgba(255,255,255,.2)' : '#FFF3E0',
                          color: isActive ? '#FFD89B' : '#92400E',
                        }}>{item.badge}</span>
                      )}
                      {item.id === 'points' && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                          background: isActive ? 'rgba(255,255,255,.2)' : '#FFF3E0',
                          color: isActive ? '#FFD89B' : '#92400E',
                        }}>{userPoints} pts</span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Séparateur */}
              <div style={{ height: 1, background: '#F5F0E8', margin: '0 8px' }} />

              {/* Déconnexion */}
              <div style={{ padding: '8px' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', border: 'none', cursor: 'pointer',
                    background: 'transparent', color: '#DC2626', fontSize: 13, fontWeight: 500,
                    borderRadius: 10, transition: 'all .15s',
                  }}
                >
                  <span style={{ display: 'flex', opacity: .7 }}><LogoutIcon /></span>
                  {' '}
                  Déconnexion
                </button>
              </div>

              {/* Club Privé promo */}
              <div style={{ margin: '0 8px 8px', borderRadius: 14, overflow: 'hidden', background: 'linear-gradient(135deg,#3D1400 0%,#5A2800 100%)', position: 'relative' }}>
                <div style={{ padding: '16px 14px 12px' }}>
                  <p style={{ color: '#D4A96A', fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Exclusif</p>
                  <p style={{ color: '#fff', fontSize: 12, fontWeight: 800, lineHeight: 1.3, marginBottom: 4 }}>{(DEFAULT_SITE_CONFIG?.branding?.siteName ?? 'SD Cosmetique').toUpperCase()}<br />CLUB PRIVÉ</p>
                  <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 10, margin: '0 0 12px', lineHeight: 1.5 }}>Des avantages exclusifs rien que pour vous !</p>
                  <button style={{
                    width: '100%', padding: '8px 0', background: 'linear-gradient(90deg,#C8974A,#E8B870)',
                    border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    letterSpacing: '0.04em',
                  }}>DÉCOUVRIR</button>
                </div>
              </div>

            </div>
          </aside>

          {/* ════════════════════════════════
              MAIN CONTENT
          ════════════════════════════════ */}
          <main style={{ flex: 1, minWidth: 0, width: '100%', paddingBottom: 40 }}>

            {/* ── DASHBOARD ── */}
            {active === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* ROW 1: Welcome + Points */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: 16 }}>

                  {/* Welcome card */}
                  <div style={{
                    borderRadius: 20, overflow: 'hidden', position: 'relative',
                    background: '#1C0A00',
                    minHeight: 220,
                  }}>
                    {/* Photo plein fond */}
                    <div style={{ position: 'absolute', inset: 0 }}>
                      <Image src={compteHeroBg} alt="SD Cosmétique" fill sizes="70vw" loading="eager"
                        style={{ objectFit: 'cover', objectPosition: 'center 20%' }} />
                    </div>
                    {/* Overlay dégradé horizontal */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(28,10,0,.96) 0%, rgba(61,20,0,.88) 42%, rgba(61,20,0,.45) 65%, transparent 100%)' }} />

                    <div style={{ position: 'relative', padding: '32px 32px 28px', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {/* Badge membre */}
                      <div style={{ marginBottom: 14 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: 'linear-gradient(135deg,rgba(200,151,74,.22) 0%,rgba(212,169,106,.18) 100%)',
                          border: '1px solid rgba(200,151,74,.35)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: 99, padding: '5px 14px',
                          fontSize: 10, color: '#E8C47A', fontWeight: 800,
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="#E8C47A"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          Membre {getJekoTierFromList(userPoints, jekoConfig.tiers).label}
                        </span>
                      </div>

                      {/* Nom */}
                      <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
                        Bienvenue
                      </p>
                      <h1 style={{
                        color: '#FFFFFF', fontSize: 32, fontWeight: 800,
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16,
                      }}>
                        {displayName}
                      </h1>

                      {/* Séparateur doré */}
                      <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg,#C8974A,#E8C47A)', borderRadius: 99, marginBottom: 14 }} />

                      <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, lineHeight: 1.6, marginBottom: 22, maxWidth: 240, fontWeight: 400 }}>
                        Merci de faire partie de la famille<br />
                        <span style={{ color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>{DEFAULT_SITE_CONFIG?.branding?.siteName ?? 'SD Cosmetique'}.</span>
                      </p>

                      {/* CTA */}
                      <div>
                        <button
                          onClick={() => setActive('profil')}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '10px 22px',
                            background: 'linear-gradient(135deg,#C8974A 0%,#D4A96A 100%)',
                            border: 'none', borderRadius: 12,
                            color: '#fff', fontSize: 12, fontWeight: 700,
                            cursor: 'pointer', letterSpacing: '0.02em',
                            boxShadow: '0 4px 16px rgba(200,151,74,.35)',
                          }}
                        >
                          Voir mon profil
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Points card */}
                  <div style={{
                    background: '#fff', borderRadius: 20, border: '1px solid #EDE8E0',
                    padding: '24px 22px', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 2px 12px rgba(61,20,0,.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: '#9A8A7A', textTransform: 'uppercase' }}>Mes Points</p>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#FDF0E0,#FAE4C0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8974A" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </div>
                    </div>
                    <p style={{ marginBottom: 2 }}>
                      <span style={{ fontSize: 48, fontWeight: 900, color: '#1A1A1A', lineHeight: 1, letterSpacing: '-0.03em' }}>{userPoints}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#C8974A', marginLeft: 6 }}>pts</span>
                    </p>
                    <p style={{ fontSize: 11, color: '#9A8A7A', marginBottom: 16, lineHeight: 1.4 }}>
                      Plus que <strong style={{ color: '#3D1400' }}>{Math.max(0, 500 - userPoints)} pts</strong> pour une réduction.
                    </p>
                    {/* Progress bar */}
                    <div style={{ background: '#F5F0E8', borderRadius: 99, height: 6, overflow: 'hidden', marginBottom: 5 }}>
                      <div style={{ width: `${Math.min(100, Math.round((userPoints / 500) * 100))}%`, height: '100%', background: 'linear-gradient(90deg,#C8974A,#E8C47A)', borderRadius: 99 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                      <span style={{ fontSize: 10, color: '#9A8A7A' }}>{userPoints} pts</span>
                      <span style={{ fontSize: 10, color: '#9A8A7A' }}>500 pts</span>
                    </div>
                    <button
                      onClick={() => setActive('points')}
                      style={{
                        padding: '10px 0', background: '#3D1400', border: 'none',
                        borderRadius: 12, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Voir mes récompenses
                    </button>
                  </div>
                </div>

                {/* ROW 2: Commandes + Favoris */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: 16 }}>

                  {/* Commandes table */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F5F0E8' }}>
                      <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#1A1A1A', textTransform: 'uppercase' }}>Mes Commandes</p>
                      <button onClick={() => setActive('commandes')} style={{ fontSize: 11, color: '#C8974A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        Voir toutes →
                      </button>
                    </div>
                    {ordersForDisplay.length === 0 ? (
                      <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                        <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 10 }}>Aucune commande pour le moment.</p>
                        <Link href="/boutique" style={{ fontSize: 12, color: '#C8974A', fontWeight: 600 }}>Découvrir la boutique →</Link>
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#FAF8F5' }}>
                            {['Commande', 'Date', 'Statut', 'Montant', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9A8A7A', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ordersForDisplay.slice(0, 5).map((order) => {
                            const st = statusConfig[order.status] ?? statusConfig['Confirmée'];
                            return (
                              <tr key={order.id} style={{ borderTop: '1px solid #F5F0E8' }}>
                                <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{order.id}</td>
                                <td style={{ padding: '11px 14px', fontSize: 12, color: '#7A6A5A', whiteSpace: 'nowrap' }}>{order.date}</td>
                                <td style={{ padding: '11px 14px' }}>
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                                    background: st.bg, color: st.color,
                                  }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, display: 'inline-block' }} />
                                    {st.label}
                                  </span>
                                </td>
                                <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: '#1A1A1A', whiteSpace: 'nowrap' }}>{order.total}</td>
                                <td style={{ padding: '11px 14px' }}>
                                  <button style={{
                                    padding: '4px 12px', background: '#FAF8F5', border: '1px solid #EDE8E0',
                                    borderRadius: 7, fontSize: 11, fontWeight: 600, color: '#6B3D14', cursor: 'pointer',
                                  }}>Détails</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Favoris */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F5F0E8' }}>
                      <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#1A1A1A', textTransform: 'uppercase' }}>Mes Favoris</p>
                      <button onClick={() => setActive('favoris')} style={{ fontSize: 11, color: '#C8974A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        Voir tous →
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 0 }}>
                      {wishlistItems.length === 0 ? (
                        <p style={{ padding: '20px', fontSize: 12, color: '#9A8A7A', gridColumn: '1 / -1', textAlign: 'center' }}>Aucun favori pour l&apos;instant</p>
                      ) : wishlistItems.slice(0, 4).map((fav, i) => (
                        <div key={fav.id} style={{
                          padding: '12px', borderRight: i % 2 === 0 ? '1px solid #F5F0E8' : 'none',
                          borderBottom: i < 2 ? '1px solid #F5F0E8' : 'none',
                          position: 'relative',
                        }}>
                          <button style={{
                            position: 'absolute', top: 8, right: 8, width: 22, height: 22,
                            background: 'rgba(255,255,255,.9)', border: '1px solid #EDE8E0',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', fontSize: 11, color: '#C8974A',
                          }}>♥</button>
                          <div style={{ height: 72, background: '#FAF8F5', borderRadius: 8, marginBottom: 8, position: 'relative', overflow: 'hidden' }}>
                            <Image src={fav.images?.[0] ?? '/products/serum.svg'} alt={fav.name} fill style={{ objectFit: 'contain', padding: 6 }} />
                          </div>
                          <p style={{ fontSize: 10, color: '#1A1A1A', fontWeight: 600, lineHeight: 1.3, marginBottom: 3 }}>{fav.name}</p>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#C8974A' }}>{formatPrice(fav.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ROW 3: Infos compte + Parrainage */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: 16 }}>

                  {/* Infos compte */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', color: '#8B4513', textTransform: 'uppercase' }}>Informations du compte</p>
                      <button onClick={() => setActive('profil')} style={{ fontSize: 13, color: '#C8974A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Modifier</button>
                    </div>

                    {/* Champs 2x2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                      {[
                        { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: 'Nom complet', val: displayName },
                        { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, label: 'Téléphone', val: displayPhone || 'Non renseigné' },
                        { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Email', val: displayEmail },
                        { svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: "Date d'inscription", val: createdAt },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <span style={{ display: 'flex', flexShrink: 0, marginTop: 2 }}>{item.svg}</span>
                          <div>
                            <p style={{ fontSize: 12, color: '#9A8A7A', marginBottom: 4, fontWeight: 400 }}>{item.label}</p>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{item.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parrainage */}
                  <div style={{
                    borderRadius: 16, overflow: 'hidden', position: 'relative',
                    background: 'linear-gradient(135deg,#FFF7ED 0%,#FEF3E8 100%)',
                    border: '1px solid #F5DDB8',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 16 }}>
                      <Image src={parrainageHeroBg} alt="" fill sizes="33vw" style={{ objectFit: 'cover', opacity: .25 }} />
                    </div>
                    <div style={{ position: 'relative', padding: '24px 20px' }}>
                      <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#92400E', textTransform: 'uppercase', marginBottom: 8 }}>Parrainez et gagnez</p>
                      <p style={{ fontSize: 12, color: '#7A5A3A', lineHeight: 1.5, marginBottom: 18 }}>
                        Parrainez vos proches et gagnez des points à chaque parrainage.
                      </p>
                      <button
                        onClick={() => setActive('points')}
                        style={{
                          width: '100%', padding: '10px 0', background: '#C8974A',
                          border: 'none', borderRadius: 10, color: '#fff',
                          fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Parrainer maintenant
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── COMMANDES PAGE ── */}
            {active === 'commandes' && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #F5F0E8' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>Mes commandes</h2>
                </div>
                {ordersForDisplay.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 36, marginBottom: 12 }}>📦</p>
                    <p style={{ fontSize: 14, color: '#9A8A7A', marginBottom: 8 }}>Vous n&apos;avez pas encore passé de commande.</p>
                    <Link href="/boutique" style={{ fontSize: 13, color: '#C8974A', fontWeight: 600 }}>Découvrir la boutique →</Link>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#FAF8F5' }}>
                        {['Commande', 'Date', 'Statut', 'Montant', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9A8A7A' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ordersForDisplay.map(order => {
                        const st = statusConfig[order.status] ?? statusConfig['Confirmée'];
                        return (
                          <tr key={order.id} style={{ borderTop: '1px solid #F5F0E8' }}>
                            <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{order.id}</td>
                            <td style={{ padding: '13px 20px', fontSize: 13, color: '#7A6A5A' }}>{order.date}</td>
                            <td style={{ padding: '13px 20px' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                background: st.bg, color: st.color,
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, display: 'inline-block' }} />
                                {st.label}
                              </span>
                            </td>
                            <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{order.total}</td>
                            <td style={{ padding: '13px 20px' }}>
                              <button style={{
                                padding: '6px 16px', background: '#FAF8F5', border: '1px solid #EDE8E0',
                                borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#6B3D14', cursor: 'pointer',
                              }}>Détails</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ── PROFIL ── */}
            {active === 'profil' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Infos personnelles */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>Informations personnelles</h2>
                  {profileMsg && (
                    <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: profileMsg.type === 'ok' ? '#ECFDF5' : '#FEF2F2', color: profileMsg.type === 'ok' ? '#059669' : '#DC2626', border: `1px solid ${profileMsg.type === 'ok' ? '#A7F3D0' : '#FECACA'}` }}>
                      {profileMsg.type === 'ok' ? '✅ ' : '❌ '}{profileMsg.text}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                    {[{ label: 'Prénom', key: 'prenom', placeholder: prenom || 'Votre prénom' }, { label: 'Nom', key: 'nom', placeholder: nom || 'Votre nom' }].map(f => (
                      <div key={f.key}>
                        <label htmlFor={`profile-${f.key}`} style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                        <input
                          id={`profile-${f.key}`}
                          type="text"
                          value={profileForm[f.key as keyof typeof profileForm]}
                          placeholder={f.placeholder}
                          onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                          style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, color: '#1A1A1A', background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    ))}
                    <div style={{ gridColumn: '1/-1' }}>
                      <label htmlFor="profile-email" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Adresse email</label>
                      <input
                        id="profile-email"
                        type="email"
                        value={profileForm.email || displayEmail}
                        onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, color: '#1A1A1A', background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label htmlFor="profile-phone" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Téléphone</label>
                      <input
                        id="profile-phone"
                        type="tel"
                        value={profileForm.telephone || displayPhone}
                        placeholder="+225 07 00 00 00 00"
                        onChange={e => setProfileForm(p => ({ ...p, telephone: e.target.value }))}
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, color: '#1A1A1A', background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <button
                    disabled={profileSaving}
                    onClick={handleProfileSave}
                    style={{ marginTop: 20, padding: '11px 28px', background: profileSaving ? '#9A8A7A' : '#3D1400', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: profileSaving ? 'not-allowed' : 'pointer' }}
                  >
                    {profileSaving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                  </button>
                </div>

                {/* Changer mot de passe */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>Changer le mot de passe</h2>
                  {pwdMsg && (
                    <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: pwdMsg.type === 'ok' ? '#ECFDF5' : '#FEF2F2', color: pwdMsg.type === 'ok' ? '#059669' : '#DC2626', border: `1px solid ${pwdMsg.type === 'ok' ? '#A7F3D0' : '#FECACA'}` }}>
                      {pwdMsg.type === 'ok' ? '✅ ' : '❌ '}{pwdMsg.text}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[{ label: 'Mot de passe actuel', key: 'current' }, { label: 'Nouveau mot de passe', key: 'next' }, { label: 'Confirmer le nouveau mot de passe', key: 'confirm' }].map(f => (
                      <div key={f.key}>
                        <label htmlFor={`pwd-${f.key}`} style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                        <input
                          id={`pwd-${f.key}`}
                          type="password"
                          value={pwdForm[f.key as keyof typeof pwdForm]}
                          onChange={e => setPwdForm(p => ({ ...p, [f.key]: e.target.value }))}
                          style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, color: '#1A1A1A', background: '#FAFAF8', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={async () => {
                      if (pwdForm.next !== pwdForm.confirm) { setPwdMsg({ type: 'err', text: 'Les mots de passe ne correspondent pas.' }); return; }
                      if (pwdForm.next.length < 8) { setPwdMsg({ type: 'err', text: 'Le mot de passe doit contenir au moins 8 caractères.' }); return; }
                      const supabase = createClient();
                      const { error } = await supabase.auth.updateUser({ password: pwdForm.next });
                      if (error) setPwdMsg({ type: 'err', text: error.message });
                      else { setPwdMsg({ type: 'ok', text: 'Mot de passe modifié avec succès !' }); setPwdForm({ current: '', next: '', confirm: '' }); }
                    }}
                    style={{ marginTop: 20, padding: '11px 28px', background: '#3D1400', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Mettre à jour le mot de passe
                  </button>
                </div>
              </div>
            )}

            {/* ── ADRESSES ── */}
            {active === 'adresses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>Mes adresses</h2>
                  <button
                    onClick={() => { setEditingAddr(null); setAddrForm({ id: '', label: 'Domicile', prenom: '', nom: '', rue: '', ville: '', code: '', pays: 'Côte d\'Ivoire', tel: '', isDefault: false }); setShowAddrForm(true); }}
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
                  <div key={addr.id} style={{ background: '#fff', borderRadius: 16, border: addr.isDefault ? '2px solid #C8974A' : '1px solid #EDE8E0', padding: '20px 24px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#1A1A1A' }}>{addr.label}</span>
                          {addr.isDefault && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 99, background: '#FFF3E0', color: '#92400E' }}>Par défaut</span>}
                        </div>
                        <p style={{ fontSize: 13, color: '#4A3828', lineHeight: 1.7 }}>
                          {addr.prenom} {addr.nom}<br />{addr.rue}<br />{addr.code} {addr.ville}<br />{addr.pays}{addr.tel ? <><br />{addr.tel}</> : ''}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefaultAddress(addr.id)} style={{ padding: '6px 12px', background: '#FAF8F5', border: '1px solid #EDE8E0', borderRadius: 8, fontSize: 11, color: '#6B3D14', cursor: 'pointer', fontWeight: 600 }}>Par défaut</button>
                        )}
                        <button onClick={() => { setAddrForm({ ...addr }); setEditingAddr(addr.id); setShowAddrForm(true); }} style={{ padding: '6px 12px', background: '#FAF8F5', border: '1px solid #EDE8E0', borderRadius: 8, fontSize: 11, color: '#6B3D14', cursor: 'pointer', fontWeight: 600 }}>Modifier</button>
                        <button onClick={() => handleDeleteAddress(addr.id)} style={{ padding: '6px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 11, color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}>Supprimer</button>
                      </div>
                    </div>
                  </div>
                ))}

                {showAddrForm && (
                  <div style={{ background: '#fff', borderRadius: 16, border: '2px solid #C8974A', padding: '24px 28px' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginBottom: 20 }}>{editingAddr ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                      <div style={{ gridColumn: '1/-1' }}>
                        <label htmlFor="addr-label" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Libellé (ex: Domicile, Bureau…)</label>
                        <select id="addr-label" value={addrForm.label} onChange={e => setAddrForm(f => ({ ...f, label: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, background: '#FAFAF8', boxSizing: 'border-box' }}>
                          {['Domicile', 'Bureau', 'Autre'].map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      {[{ label: 'Prénom', key: 'prenom' }, { label: 'Nom', key: 'nom' }, { label: 'Adresse', key: 'rue', full: true }, { label: 'Ville', key: 'ville' }, { label: 'Code postal', key: 'code' }, { label: 'Téléphone', key: 'tel' }].map(f => (
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
                        <input type="checkbox" id="addrDefault" checked={addrForm.isDefault} onChange={e => setAddrForm(f => ({ ...f, isDefault: e.target.checked }))} />
                        <label htmlFor="addrDefault" style={{ fontSize: 13, color: '#4A3828', cursor: 'pointer' }}>Définir comme adresse par défaut</label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                      <button
                        onClick={handleSaveAddress}
                        style={{ padding: '11px 28px', background: '#3D1400', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      >{editingAddr ? 'Enregistrer' : 'Ajouter'}</button>
                      <button onClick={() => { setShowAddrForm(false); setEditingAddr(null); }} style={{ padding: '11px 20px', background: 'none', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, color: '#6B3D14', cursor: 'pointer' }}>Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PAIEMENTS (Premium placeholder) ── */}
            {active === 'paiements' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Mes moyens de paiement</h2>
                  <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 24 }}>Gérez vos modes de paiement enregistrés.</p>
                  <div style={{ background: 'linear-gradient(135deg,#3D1400,#6B3D14)', borderRadius: 16, padding: '24px', color: '#fff', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
                    <div style={{ position: 'absolute', bottom: -20, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(200,151,74,.15)' }} />
                    <p style={{ fontSize: 11, opacity: .7, marginBottom: 16, letterSpacing: '0.1em' }}>CARTE DE FIDÉLITÉ</p>
                    <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 8 }}>**** **** **** ••••</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: .8 }}>
                      <span>{displayName.toUpperCase()}</span>
                      <span>{(DEFAULT_SITE_CONFIG?.branding?.siteName ?? 'SD Cosmetique').toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{ background: '#FFF7ED', border: '1px dashed #C8974A', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 14, color: '#92400E', fontWeight: 700, marginBottom: 4 }}>💳 Paiement Mobile Money disponible</p>
                    <p style={{ fontSize: 12, color: '#9A8A7A' }}>Orange Money • MTN Mobile Money • Wave</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── FAVORIS ── */}
            {active === 'favoris' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>Mes favoris</h2>
                {wishlistItems.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '48px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 40, marginBottom: 12 }}>🤍</p>
                    <p style={{ fontSize: 14, color: '#9A8A7A', marginBottom: 16 }}>Votre liste de favoris est vide.</p>
                    <Link href="/boutique" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? 320 : 'none', padding: '10px 24px', background: '#3D1400', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Découvrir nos produits</Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
                    {wishlistItems.map(product => (
                      <div key={product.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', height: 180, background: '#FAF8F5' }}>
                          <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1px solid #EDE8E0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: '#DC2626' }}
                          >♥</button>
                        </div>
                        <div style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 4, lineHeight: 1.3 }}>{product.name}</p>
                          <p style={{ fontSize: 14, fontWeight: 800, color: '#C8974A', marginBottom: 12 }}>{formatPrice(product.price)}</p>
                          <Link href={`/boutique/${product.slug}`} style={{ display: 'block', textAlign: 'center', padding: '8px 0', background: '#3D1400', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Voir le produit</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── AVIS ── */}
            {active === 'avis' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>Mes avis produits</h2>
                  {ordersForDisplay.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <p style={{ fontSize: 40, marginBottom: 12 }}>⭐</p>
                      <p style={{ fontSize: 14, color: '#9A8A7A', marginBottom: 16 }}>Passez votre première commande pour laisser un avis.</p>
                      <Link href="/boutique" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? 320 : 'none', padding: '10px 24px', background: '#3D1400', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Découvrir nos produits</Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {ordersForDisplay.slice(0, 5).map(order => (
                        <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#FAF8F5', borderRadius: 12, border: '1px solid #EDE8E0' }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>Commande {order.id}</p>
                            <p style={{ fontSize: 11, color: '#9A8A7A' }}>Livrée le {order.date}</p>
                          </div>
                          <div style={{ display: 'flex', gap: 2, marginRight: 'auto', marginLeft: 20 }}>
                            {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 16, color: '#F59E0B' }}>★</span>)}
                          </div>
                          <button style={{ padding: '7px 18px', background: '#3D1400', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Laisser un avis</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── POINTS SDZ FIDÉLITÉ ── */}
            {active === 'points' && (() => {
              const tier = getJekoTierFromList(userPoints, jekoConfig.tiers);
              const nextPts = tier.next === Infinity ? userPoints : tier.next;
              const progress = tier.next === Infinity ? 100 : Math.min(100, Math.round((userPoints / tier.next) * 100));

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* ── Message rédemption ── */}
                  {redeemMsg && (
                    <div style={{
                      padding: '14px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                      background: redeemMsg.type === 'ok' ? '#ECFDF5' : '#FEF2F2',
                      color: redeemMsg.type === 'ok' ? '#059669' : '#DC2626',
                      border: `1px solid ${redeemMsg.type === 'ok' ? '#A7F3D0' : '#FECACA'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span>{redeemMsg.text}</span>
                      <button onClick={() => setRedeemMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit', opacity: .6 }}>✕</button>
                    </div>
                  )}

                  {/* ── Modal confirmation rédemption ── */}
                  {redeemingReward && (
                    <div style={{
                      position: 'fixed', inset: 0, zIndex: 9999,
                      background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', maxWidth: 380, width: '90%', textAlign: 'center' }}>
                        <p style={{ fontSize: 40, marginBottom: 12 }}>{redeemingReward.icon}</p>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', marginBottom: 8 }}>Confirmer la récompense</h3>
                        <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 6 }}>{redeemingReward.description}</p>
                        <p style={{ fontSize: 13, color: '#C8974A', fontWeight: 700, marginBottom: 24 }}>
                          {redeemingReward.pts} points seront déduits de votre solde.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            onClick={() => setRedeemingReward(null)}
                            style={{ flex: 1, padding: '12px 0', background: '#F5F0E8', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#3D1400', cursor: 'pointer' }}
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleRedeemReward}
                            style={{ flex: 1, padding: '12px 0', background: '#3D1400', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                          >
                            Confirmer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Carte de fidélité ── */}
                  <div style={{
                    position: 'relative', width: '100%', maxWidth: 440, margin: '0 auto',
                    aspectRatio: '1.586 / 1',
                    borderRadius: 20,
                    background: getTierGradient(tier.label),
                    boxShadow: '0 20px 60px rgba(0,0,0,.35), 0 4px 16px rgba(0,0,0,.2)',
                    overflow: 'hidden',
                    color: '#fff',
                    userSelect: 'none',
                  }}>
                    {/* Cercles décoratifs */}
                    <div style={{
                      position: 'absolute', top: -40, right: -40,
                      width: 200, height: 200, borderRadius: '50%',
                      background: 'rgba(255,255,255,.05)',
                    }} />
                    <div style={{
                      position: 'absolute', bottom: -60, left: -20,
                      width: 240, height: 240, borderRadius: '50%',
                      background: 'rgba(255,255,255,.04)',
                    }} />
                    {/* Lignes diagonales décoratives */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,.015) 40px, rgba(255,255,255,.015) 41px)',
                    }} />

                    {/* Contenu */}
                    <div style={{ position: 'relative', zIndex: 1, padding: '24px 28px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>

                      {/* Ligne haute */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        {/* Logo SD */}
                        <div>
                          <p style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.08em', lineHeight: 1 }}>
                            SD<span style={{ opacity: .6, fontWeight: 400 }}> cosmétique</span>
                          </p>
                          <p style={{ fontSize: 9, opacity: .5, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>Carte de Fidélité</p>
                        </div>
                        {/* Chip NFC */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <div style={{
                            width: 36, height: 28, borderRadius: 6,
                            background: 'linear-gradient(135deg, rgba(255,215,100,.6), rgba(255,215,100,.2))',
                            border: '1px solid rgba(255,215,100,.4)',
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr',
                            gap: 2, padding: 4, boxSizing: 'border-box',
                          }}>
                            {['chip-1', 'chip-2', 'chip-3', 'chip-4'].map(segment => (
                              <div key={segment} style={{ background: 'rgba(255,215,100,.35)', borderRadius: 1 }} />
                            ))}
                          </div>
                          {/* WiFi NFC icon */}
                          <svg width="18" height="14" viewBox="0 0 24 18" fill="none" style={{ opacity: .5 }}>
                            <path d="M12 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" fill="white"/>
                            <path d="M6.5 11C7.9 9.3 9.8 8 12 8s4.1 1.3 5.5 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                            <path d="M2 7C4.6 4 8.1 2 12 2s7.4 2 10 5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeOpacity=".5"/>
                          </svg>
                        </div>
                      </div>

                      {/* Points au centre */}
                      <div>
                        <p style={{ fontSize: 9, opacity: .5, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>Solde SD</p>
                        <p style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>
                          {userPoints.toLocaleString('fr-FR')}
                          <span style={{ fontSize: 16, fontWeight: 500, opacity: .6, marginLeft: 6 }}>pts</span>
                        </p>
                        <p style={{ fontSize: 10, opacity: .5, marginTop: 4 }}>≈ {(userPoints * 10).toLocaleString('fr-FR')} FCFA de réduction</p>
                      </div>

                      {/* Ligne basse */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        {/* Nom membre */}
                        <div>
                          <p style={{ fontSize: 9, opacity: .45, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 3 }}>Membre</p>
                          {[`${profileForm.prenom} ${profileForm.nom}`.trim() || displayEmail || 'SD Client'].map(n => (
                            <p key={n} style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              {n.length > 22 ? n.slice(0, 22) + '…' : n}
                            </p>
                          ))}
                        </div>
                        {/* Badge tier */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: 'rgba(255,255,255,.12)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,.2)',
                            borderRadius: 99, padding: '5px 12px',
                          }}>
                            <span style={{ fontSize: 14 }}>{tier.emoji}</span>
                            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{tier.label}</span>
                          </div>
                          {tier.next !== Infinity && (
                            <p style={{ fontSize: 9, opacity: .45, marginTop: 4 }}>
                              {(tier.next - userPoints).toLocaleString('fr-FR')} pts → {jekoNextLabel(tier.label, jekoConfig.tiers)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Progression ── */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Progression Jeko
                      </p>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                        background: tier.bg, color: tier.textColor,
                      }}>
                        {tier.emoji} {tier.label}
                        {tier.next !== Infinity && ` → ${jekoNextLabel(tier.label, jekoConfig.tiers)}`}
                      </span>
                    </div>
                    <div style={{ background: '#F5F0E8', borderRadius: 99, height: 10, overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg,${tier.color},#E8C47A)`, borderRadius: 99, transition: 'width .6s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9A8A7A' }}>
                      <span>{userPoints} pts</span>
                      <span>{tier.next === Infinity ? '🏆 Niveau max !' : `${nextPts} pts`}</span>
                    </div>
                  </div>

                  {/* ── Récompenses ── */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '20px 24px' }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
                      Récompenses disponibles
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 12 }}>
                      {jekoConfig.rewards.filter(r => r.active !== false).map(r => {
                        const unlocked = userPoints >= r.pts;
                        return (
                          <div key={r.id} style={{
                            borderRadius: 12,
                            border: `1px solid ${unlocked ? '#C8974A' : '#EDE8E0'}`,
                            padding: '16px 12px', textAlign: 'center',
                            background: unlocked ? '#FFF7ED' : '#FAFAF8',
                            opacity: unlocked ? 1 : 0.6,
                            transition: 'all .2s',
                          }}>
                            <p style={{ fontSize: 28, marginBottom: 8 }}>{r.icon}</p>
                            <p style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 4 }}>{r.label}</p>
                            <p style={{ fontSize: 10, color: '#9A8A7A', marginBottom: 4 }}>{r.description}</p>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#C8974A', marginBottom: 12 }}>{r.pts} points</p>
                            <button
                              disabled={!unlocked}
                              onClick={() => { setRedeemMsg(null); setRedeemingReward(r); }}
                              style={{
                                width: '100%', padding: '8px 0',
                                background: unlocked ? '#3D1400' : '#EDE8E0',
                                border: 'none', borderRadius: 8,
                                color: unlocked ? '#fff' : '#9A8A7A',
                                fontSize: 11, fontWeight: 700,
                                cursor: unlocked ? 'pointer' : 'not-allowed',
                              }}
                            >
                              {unlocked ? 'Utiliser' : 'Bloqué'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Comment gagner des points ── */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '20px 24px' }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
                      Comment gagner des Jeko ?
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                      {[
                        { icon: '🛍️', title: 'Chaque achat', desc: '10 pts pour 1 000 FCFA dépensés' },
                        { icon: '🎉', title: 'Inscription', desc: '20 pts offerts à la bienvenue' },
                        { icon: '👥', title: 'Parrainage', desc: '50 pts par ami parrainé' },
                        { icon: '⭐', title: 'Laisser un avis', desc: '5 pts par avis produit vérifié' },
                      ].map(item => (
                        <div key={item.title} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '12px 14px', background: '#FAF8F5', borderRadius: 10,
                          border: '1px solid #F0EBE3',
                        }}>
                          <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>{item.title}</p>
                            <p style={{ fontSize: 11, color: '#9A8A7A' }}>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Historique ── */}
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '20px 24px' }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
                      Historique des points
                    </p>
                    {jekoHistory.length === 0 ? (
                      <p style={{ fontSize: 13, color: '#9A8A7A', textAlign: 'center', padding: '20px 0' }}>
                        Aucune transaction pour le moment.
                      </p>
                    ) : (
                      jekoHistory.map((tx, i) => {
                        const isCredit = tx.points > 0;
                        return (
                          <div
                            key={tx.id}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 0',
                              borderBottom: i < jekoHistory.length - 1 ? '1px solid #F5F0E8' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isCredit ? '#ECFDF5' : '#FEF2F2',
                                fontSize: 14,
                              }}>
                                {getTransactionIcon(tx.reason)}
                              </div>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
                                  {reasonLabel(tx.reason, tx.label)}
                                </p>
                                <p style={{ fontSize: 11, color: '#9A8A7A' }}>
                                  {formatJekoDate(tx.created_at)}
                                </p>
                              </div>
                            </div>
                            <span style={{
                              fontSize: 15, fontWeight: 800,
                              color: isCredit ? '#059669' : '#DC2626',
                            }}>
                              {isCredit ? '+' : ''}{tx.points} pts
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              );
            })()}

            {/* ── NEWSLETTER ── */}
            {active === 'newsletter' && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '32px 28px' }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Newsletter</h2>
                <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 32 }}>Gérez vos préférences de communication.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[{ key: 'newsletter', label: `Newsletter ${DEFAULT_SITE_CONFIG?.branding?.siteName ?? 'SD Cosmetique'}`, desc: 'Recevez nos actualités, offres exclusives et conseils beauté.' }, { key: 'promo', label: 'Offres promotionnelles', desc: 'Soyez informé(e) en avant-première de nos soldes et codes promo.' }, { key: 'tips', label: 'Conseils & astuces beauté', desc: 'Recevez nos guides et tutoriels pour sublimer votre peau.' }].map(item => (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: '#FAF8F5', borderRadius: 12, border: '1px solid #EDE8E0' }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>{item.label}</p>
                        <p style={{ fontSize: 12, color: '#9A8A7A' }}>{item.desc}</p>
                      </div>
                      <button
                        onClick={() => { setNewsletter(v => !v); setNewsletterSaved(false); }}
                        style={{ flexShrink: 0, marginLeft: 20, width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: newsletter ? '#3D1400' : '#EDE8E0', position: 'relative', transition: 'background .2s' }}
                      >
                        <span style={{ position: 'absolute', top: 3, left: newsletter ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', display: 'block' }} />
                      </button>
                    </div>
                  ))}
                </div>

                {newsletterSaved && <p style={{ marginTop: 16, fontSize: 13, color: '#059669', fontWeight: 600 }}>✅ Préférences enregistrées !</p>}
                <button
                  onClick={async () => {
                    if (user) {
                      const supabase = createClient();
                      await supabase.from('profiles').upsert({ id: user.id, newsletter });
                    }
                    setNewsletterSaved(true);
                  }}
                  style={{ marginTop: 24, padding: '11px 28px', background: '#3D1400', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Enregistrer mes préférences
                </button>
              </div>
            )}

            {/* ── PARAMÈTRES ── */}
            {active === 'parametres' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Langue / région */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>Préférences</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                    <div>
                      <label htmlFor="pref-language" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Langue</label>
                      <select id="pref-language" style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, background: '#FAFAF8', boxSizing: 'border-box' }}>
                        <option>Français</option><option>English</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="pref-currency" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B3D14', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Devise</label>
                      <select id="pref-currency" style={{ width: '100%', padding: '10px 14px', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 13, background: '#FAFAF8', boxSizing: 'border-box' }}>
                        <option>FCFA (XOF)</option><option>EUR (€)</option><option>USD ($)</option>
                      </select>
                    </div>
                  </div>
                  <button style={{ marginTop: 20, padding: '11px 28px', background: '#3D1400', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Enregistrer</button>
                </div>

                {/* Notifications */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE8E0', padding: '24px 28px' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>Notifications</h2>
                  {[{ label: 'Statut de commande', desc: 'Recevez les mises à jour de vos commandes par email.' }, { label: 'Promotions exclusives', desc: 'Soyez alerté(e) des offres réservées aux membres.' }].map((n, i) => (
                    <div key={n.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i === 0 ? '1px solid #F5F0E8' : 'none' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>{n.label}</p>
                        <p style={{ fontSize: 12, color: '#9A8A7A' }}>{n.desc}</p>
                      </div>
                      <div style={{ width: 48, height: 26, borderRadius: 99, background: '#3D1400', position: 'relative', flexShrink: 0, marginLeft: 20 }}>
                        <span style={{ position: 'absolute', top: 3, left: 24, width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'block' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Zone danger */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #FECACA', padding: '24px 28px' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#DC2626', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Zone de danger</h2>
                  <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 20 }}>La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.</p>
                  <div style={{ marginBottom: 12 }}>
                    <label htmlFor="delete-confirm" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#DC2626', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tapez &quot;SUPPRIMER&quot; pour confirmer</label>
                    <input
                      id="delete-confirm"
                      type="text"
                      value={deleteConfirm}
                      onChange={e => setDeleteConfirm(e.target.value)}
                      placeholder="SUPPRIMER"
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #FECACA', borderRadius: 10, fontSize: 13, background: '#FEF2F2', outline: 'none', boxSizing: 'border-box', maxWidth: 320 }}
                    />
                  </div>
                  <button
                    disabled={deleteConfirm !== 'SUPPRIMER'}
                    onClick={async () => {
                      if (deleteConfirm !== 'SUPPRIMER') return;
                      const supabase = createClient();
                      await supabase.auth.signOut();
                      router.push('/');
                    }}
                    style={{ padding: '11px 24px', background: deleteConfirm === 'SUPPRIMER' ? '#DC2626' : '#EDE8E0', border: 'none', borderRadius: 10, color: deleteConfirm === 'SUPPRIMER' ? '#fff' : '#9A8A7A', fontSize: 13, fontWeight: 700, cursor: deleteConfirm === 'SUPPRIMER' ? 'pointer' : 'not-allowed' }}
                  >
                    Supprimer définitivement mon compte
                  </button>
                </div>
              </div>
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

/* ── SVG ICONS ── */
function HomeIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function BoxIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
}
function PinIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function CardIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function HeartIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
function StarIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function UserIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function GiftIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
}
function MailIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function SettingsIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function LogoutIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function LockIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9A8A7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
