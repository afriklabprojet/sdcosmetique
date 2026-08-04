'use client';

/* Onglet «branding» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import ImageUpload from '@/shared/ui/image.input';
import Image from 'next/image';
import { getSaveButtonText } from '@/features/admin/admin.util';
import { type BrandingConfig, type SiteConfig } from '@/features/site-config/site-config.type';
import { BG, SURFACE, BORDER, GOLD, TEXT, TEXT2, TEXT3, GOLD2, S_SAVE_BG, S_SAVE_T } from '@/features/admin/admin.constant';

interface BrandingTabProps {
  readonly siteContent: SiteConfig;
  readonly setSiteContent: React.Dispatch<React.SetStateAction<SiteConfig>>;
  readonly saveConfigSection: (key: string, value: unknown) => Promise<void>;
  readonly contentSaving: Record<string, boolean>;
  readonly contentSaved: Record<string, boolean>;
}

export default function BrandingTab({ siteContent, setSiteContent, saveConfigSection, contentSaving, contentSaved }: BrandingTabProps) {
            const DEFAULT_BR: BrandingConfig = {
              siteName: 'SD Cosmetique', tagline: 'Beauté Africaine de Prestige',
              description: 'Soins premium formulés pour les peaux mélanisées.',
              logoUrl: '', faviconUrl: '',
              seoTitle: 'SD Cosmetique — Beauté Africaine de Prestige',
              seoDescription: "Soins premium pour peaux mélanisées. Livraison rapide en Côte d'Ivoire.",
              ogTitle: 'SD Cosmetique — Beauté Africaine de Prestige',
              ogDescription: 'Révélez la beauté naturelle de votre teint avec nos soins exclusifs.',
              twitterHandle: '@sdcosmetique', themeColor: '#8F5922',
              instagramUrl: '', tiktokUrl: '', facebookUrl: '', youtubeUrl: '', linkedinUrl: '',
            };
            const br: BrandingConfig = siteContent.branding ?? DEFAULT_BR;
            const save = async () => { await saveConfigSection('branding', siteContent.branding ?? DEFAULT_BR); };
            const update = (patch: Partial<BrandingConfig>) =>
              setSiteContent((c: SiteConfig) => ({ ...c, branding: { ...(c.branding ?? DEFAULT_BR), ...patch } }));

            // ── Helpers ────────────────────────────────────────────────
            const fieldStyle = { background: BG, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 12px', color: TEXT, fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' as const, transition: 'border-color .15s, box-shadow .15s' };
            const labelStyle = { fontSize: '11px', color: TEXT2, marginBottom: '6px', display: 'block' as const, fontWeight: 600, letterSpacing: '0.02em' };
            const sectionCard = { background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '22px 24px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };
            const sectionTitle = { fontSize: '12px', fontWeight: 800, color: GOLD, marginBottom: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' as const };
            const sectionSubtitle = { fontSize: '11px', color: TEXT3, marginBottom: '18px' };
            const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' };

            // Completion %
            const totalFields = 15;
            const filledFields = [br.siteName, br.tagline, br.description, br.logoUrl, br.faviconUrl, br.seoTitle, br.seoDescription, br.ogTitle, br.ogDescription, br.twitterHandle, br.themeColor, br.instagramUrl, br.tiktokUrl, br.facebookUrl, br.youtubeUrl].filter(v => v && v.trim().length > 0).length;
            const completion = Math.round((filledFields / totalFields) * 100);
            let completionColor = '#EF4444';
            if (completion === 100) completionColor = '#10B981';
            else if (completion > 60) completionColor = '#F59E0B';

            // Char counter color
            const counterColor = (len: number, max: number) => {
              if (len === 0) return TEXT3;
              if (len > max) return '#EF4444';
              if (len > max * 0.9) return '#F59E0B';
              return '#10B981';
            };

            // Brand initials
            const initials = (br.siteName || 'SD').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

            // Color palette presets (cosmetic / luxury)
            const palette = ['#8F5922', '#D4A25A', '#B8860B', '#C0392B', '#1C1610', '#2C3E50', '#8E44AD', '#27AE60', '#E91E63', '#FF6F00'];

            // Hex contrast helper (returns BG color for text on this bg)
            const contrastText = (hex: string): string => {
              const h = hex.replace('#', '');
              if (h.length !== 6) return '#fff';
              const r = Number.parseInt(h.slice(0, 2), 16);
              const g = Number.parseInt(h.slice(2, 4), 16);
              const b = Number.parseInt(h.slice(4, 6), 16);
              const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              return lum > 0.55 ? '#1C1610' : '#FFFFFF';
            };

            // Social meta
            const socials: { key: keyof BrandingConfig; label: string; icon: string; placeholder: string; brand: string }[] = [
              { key: 'instagramUrl', label: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/sdcosmetique', brand: '#E1306C' },
              { key: 'tiktokUrl',    label: 'TikTok',    icon: '🎵', placeholder: 'https://tiktok.com/@sdcosmetique', brand: '#000000' },
              { key: 'facebookUrl',  label: 'Facebook',  icon: '📘', placeholder: 'https://facebook.com/sdcosmetique', brand: '#1877F2' },
              { key: 'youtubeUrl',   label: 'YouTube',   icon: '▶️', placeholder: 'https://youtube.com/@sdcosmetique', brand: '#FF0000' },
              { key: 'linkedinUrl',  label: 'LinkedIn',  icon: '💼', placeholder: 'https://linkedin.com/company/sdcosmetique', brand: '#0A66C2' },
            ];

            const isValidUrl = (v: string) => {
              if (!v) return false;
              try { new URL(v); return true; } catch { return false; }
            };

            return (
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* ── Hero header avec preview live ── */}
                <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', border: `1px solid ${BORDER}`, background: `linear-gradient(135deg, ${br.themeColor}22 0%, ${SURFACE} 60%)` }}>
                  <div style={{ padding: '28px 28px 24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    {br.logoUrl ? (
                      <Image src={br.logoUrl} alt={br.siteName} width={72} height={72} unoptimized
                        style={{ borderRadius: '18px', objectFit: 'contain', background: '#fff', padding: '8px', boxShadow: `0 8px 24px ${br.themeColor}40`, flexShrink: 0, border: `1px solid ${BORDER}` }} />
                    ) : (
                      <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: `linear-gradient(135deg, ${br.themeColor}, ${br.themeColor}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800, color: contrastText(br.themeColor), boxShadow: `0 8px 24px ${br.themeColor}40`, flexShrink: 0, letterSpacing: '0.02em' }}>{initials}</div>
                    )}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h1 style={{ fontSize: '24px', fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.02em' }}>{br.siteName || 'Nom du site'}</h1>
                      <p style={{ fontSize: '13px', color: GOLD, margin: '4px 0 0', fontStyle: 'italic', letterSpacing: '0.04em' }}>« {br.tagline || 'Votre tagline ici'} »</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: BG, borderRadius: '99px', border: `1px solid ${BORDER}`, fontSize: '11px', color: TEXT2, fontWeight: 600 }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: completionColor }} />
                          {completion}% complété
                        </div>
                        <div style={{ flex: 1, minWidth: '120px', height: '6px', background: BG, borderRadius: '99px', overflow: 'hidden', border: `1px solid ${BORDER}`, maxWidth: '240px' }}>
                          <div style={{ width: `${completion}%`, height: '100%', background: `linear-gradient(90deg, ${br.themeColor}, ${GOLD})`, transition: 'width .4s ease' }} />
                        </div>
                      </div>
                    </div>
                    <button onClick={save} disabled={contentSaving.branding}
                      style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', background: contentSaved.branding ? S_SAVE_BG : GOLD2, color: contentSaved.branding ? S_SAVE_T : BG, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                      {getSaveButtonText(contentSaved.branding, contentSaving.branding)}
                    </button>
                  </div>
                </div>

                {/* ── Identité visuelle (logo + favicon) ── */}
                <div style={sectionCard}>
                  <p style={sectionTitle}>● Identité visuelle</p>
                  <p style={sectionSubtitle}>Logo principal (header, footer, partages) et favicon (onglet navigateur).</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
                    <div>
                      <span style={labelStyle}>Logo principal <span style={{ color: TEXT3, fontWeight: 400 }}>(SVG ou PNG transparent recommandé, ratio horizontal)</span></span>
                      <ImageUpload
                        value={br.logoUrl}
                        onChange={(url) => update({ logoUrl: url })}
                        folder="branding"
                        label="Logo"
                        previewSize={120}
                      />
                    </div>
                    <div>
                      <span style={labelStyle}>Favicon <span style={{ color: TEXT3, fontWeight: 400 }}>(carré, 512×512 px idéal)</span></span>
                      <ImageUpload
                        value={br.faviconUrl}
                        onChange={(url) => update({ faviconUrl: url })}
                        folder="branding"
                        label="Favicon"
                        previewSize={100}
                      />
                    </div>
                  </div>
                  {(br.logoUrl || br.faviconUrl) && (
                    <div style={{ marginTop: '16px', padding: '14px 16px', background: BG, border: `1px solid ${BORDER}`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: TEXT3, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Aperçu onglet&nbsp;:</span>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: SURFACE, padding: '6px 12px 6px 8px', borderRadius: '8px 8px 0 0', border: `1px solid ${BORDER}`, borderBottom: 'none' }}>
                        {br.faviconUrl ? (
                          <Image src={br.faviconUrl} alt="" width={14} height={14} unoptimized
                            style={{ borderRadius: '2px' }} />
                        ) : (
                          <span style={{ width: '14px', height: '14px', borderRadius: '2px', background: br.themeColor, display: 'inline-block' }} />
                        )}
                        <span style={{ fontSize: '12px', color: TEXT2 }}>{br.siteName}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Image de fond — connexion admin ── */}
                <div style={sectionCard}>
                  <p style={sectionTitle}>● Image de fond — page de connexion admin</p>
                  <p style={sectionSubtitle}>Photo affichée sur la moitié gauche de l&apos;écran de connexion administrateur.</p>
                  <ImageUpload
                    value={br.adminLoginBg ?? '/hero/generated-skincare-hero-2.jpg'}
                    onChange={(url) => update({ adminLoginBg: url })}
                    folder="branding"
                    label="Fond connexion admin"
                    previewSize={160}
                  />
                </div>

                {/* ── Image de fond — Espace Client (/compte) ── */}
                <div style={sectionCard}>
                  <p style={sectionTitle}>● Image de fond — Espace Client</p>
                  <p style={sectionSubtitle}>Photo affichée en arrière-plan de la page Espace Client (/compte).</p>
                  <ImageUpload
                    value={br.compteHeroBg ?? '/hero/generated-skincare-hero.jpg'}
                    onChange={(url) => update({ compteHeroBg: url })}
                    folder="branding"
                    label="Fond espace client"
                    previewSize={160}
                  />
                </div>

                {/* ── Image de fond — Carte Parrainage ── */}
                <div style={sectionCard}>
                  <p style={sectionTitle}>● Image de fond — Carte Parrainage</p>
                  <p style={sectionSubtitle}>Photo en arrière-plan de la carte &quot;Parrainez et gagnez&quot; sur la page Espace Client.</p>
                  <ImageUpload
                    value={br.parrainageHeroBg ?? '/hero/generated-skincare-hero-2.jpg'}
                    onChange={(url) => update({ parrainageHeroBg: url })}
                    folder="branding"
                    label="Fond parrainage"
                    previewSize={160}
                  />
                </div>

                {/* ── Identité du site ── */}
                <div style={sectionCard}>
                  <p style={sectionTitle}>● Identité du site</p>
                  <p style={sectionSubtitle}>Le nom, l&apos;accroche et la description courte de votre marque.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={grid2}>
                      <label>
                        <span style={labelStyle}>Nom du site</span>
                        <input type="text" value={br.siteName} onChange={e => update({ siteName: e.target.value })} style={fieldStyle} placeholder="SD Cosmetique" />
                      </label>
                      <label>
                        <span style={labelStyle}>Tagline (signature)</span>
                        <input type="text" value={br.tagline} onChange={e => update({ tagline: e.target.value })} style={fieldStyle} placeholder="Beauté Africaine de Prestige" />
                      </label>
                    </div>
                    <label>
                      <span style={labelStyle}>Description courte de la marque</span>
                      <textarea value={br.description} onChange={e => update({ description: e.target.value })}
                        style={{ ...fieldStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Soins premium formulés pour les peaux mélanisées..." />
                      <span style={{ fontSize: '10px', color: counterColor(br.description.length, 200), marginTop: '4px', display: 'block', fontWeight: 600 }}>{br.description.length} caractères</span>
                    </label>
                  </div>
                </div>

                {/* ── SEO + Aperçu Google ── */}
                <div style={sectionCard}>
                  <p style={sectionTitle}>● Référencement SEO</p>
                  <p style={sectionSubtitle}>Comment votre site apparaît dans les résultats de recherche Google.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <label>
                        <span style={labelStyle}>Titre SEO (balise &lt;title&gt;)</span>
                        <input type="text" value={br.seoTitle} onChange={e => update({ seoTitle: e.target.value })} style={fieldStyle} />
                        <span style={{ fontSize: '10px', color: counterColor(br.seoTitle.length, 70), marginTop: '4px', display: 'block', fontWeight: 600 }}>{br.seoTitle.length} / 70 caractères</span>
                      </label>
                      <label>
                        <span style={labelStyle}>Meta description SEO</span>
                        <textarea value={br.seoDescription} onChange={e => update({ seoDescription: e.target.value })}
                          style={{ ...fieldStyle, minHeight: '90px', resize: 'vertical' }} />
                        <span style={{ fontSize: '10px', color: counterColor(br.seoDescription.length, 160), marginTop: '4px', display: 'block', fontWeight: 600 }}>{br.seoDescription.length} / 160 caractères</span>
                      </label>
                    </div>
                    {/* Google preview */}
                    <div>
                      <span style={labelStyle}>Aperçu Google</span>
                      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '16px 18px', fontFamily: 'arial, sans-serif' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: br.themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: contrastText(br.themeColor) }}>{initials[0]}</div>
                          <div>
                            <div style={{ fontSize: '12px', color: '#202124', fontWeight: 500 }}>{br.siteName}</div>
                            <div style={{ fontSize: '11px', color: '#5f6368' }}>sdcosmetique.com</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '18px', color: '#1a0dab', lineHeight: '1.3', marginTop: '4px', cursor: 'pointer' }}>{br.seoTitle || 'Titre SEO de votre site'}</div>
                        <div style={{ fontSize: '13px', color: '#4d5156', marginTop: '4px', lineHeight: '1.4' }}>{br.seoDescription || 'La meta description apparaîtra ici…'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Open Graph + Aperçu social ── */}
                <div style={sectionCard}>
                  <p style={sectionTitle}>● Partage social (Open Graph)</p>
                  <p style={sectionSubtitle}>L&apos;aperçu lorsqu&apos;un lien est partagé sur Facebook, X, WhatsApp, LinkedIn…</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <label>
                        <span style={labelStyle}>Titre OG</span>
                        <input type="text" value={br.ogTitle} onChange={e => update({ ogTitle: e.target.value })} style={fieldStyle} />
                      </label>
                      <label>
                        <span style={labelStyle}>Description OG</span>
                        <textarea value={br.ogDescription} onChange={e => update({ ogDescription: e.target.value })}
                          style={{ ...fieldStyle, minHeight: '70px', resize: 'vertical' }} />
                      </label>
                      <label>
                        <span style={labelStyle}>Handle Twitter / X</span>
                        <input type="text" value={br.twitterHandle} onChange={e => update({ twitterHandle: e.target.value })} style={fieldStyle} placeholder="@sdcosmetique" />
                      </label>
                    </div>
                    {/* OG card preview */}
                    <div>
                      <span style={labelStyle}>Aperçu carte sociale</span>
                      <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${BORDER}`, background: '#fff' }}>
                        <div style={{ height: '140px', background: `linear-gradient(135deg, ${br.themeColor}, ${br.themeColor}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800, color: contrastText(br.themeColor), backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>{initials}</div>
                          <span style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontWeight: 600, letterSpacing: '0.06em' }}>1200×630</span>
                        </div>
                        <div style={{ padding: '12px 14px', background: '#fff' }}>
                          <div style={{ fontSize: '10px', color: '#65676B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>SDCOSMETIQUE.COM</div>
                          <div style={{ fontSize: '14px', color: '#1c1e21', fontWeight: 600, lineHeight: '1.3', marginBottom: '4px' }}>{br.ogTitle || 'Titre OG'}</div>
                          <div style={{ fontSize: '12px', color: '#65676B', lineHeight: '1.35' }}>{br.ogDescription || 'Description OG…'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Couleur de marque ── */}
                <div style={sectionCard}>
                  <p style={sectionTitle}>● Couleur de marque</p>
                  <p style={sectionSubtitle}>Utilisée pour le manifeste PWA, la barre de navigateur mobile et les accents visuels.</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <input type="color" value={br.themeColor} onChange={e => update({ themeColor: e.target.value })}
                      style={{ width: '52px', height: '44px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: 'transparent', cursor: 'pointer', padding: '2px' }} />
                    <input type="text" value={br.themeColor} onChange={e => update({ themeColor: e.target.value })}
                      style={{ ...fieldStyle, maxWidth: '140px', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }} placeholder="#8F5922" />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ padding: '8px 14px', borderRadius: '8px', background: br.themeColor, color: contrastText(br.themeColor), fontSize: '12px', fontWeight: 700 }}>Bouton</div>
                      <div style={{ padding: '8px 14px', borderRadius: '8px', background: 'transparent', color: br.themeColor, fontSize: '12px', fontWeight: 700, border: `1.5px solid ${br.themeColor}` }}>Outline</div>
                    </div>
                  </div>
                  <div>
                    <span style={{ ...labelStyle, marginBottom: '8px' }}>Palette suggérée</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {palette.map(c => {
                        const active = c.toLowerCase() === br.themeColor.toLowerCase();
                        return (
                          <button key={c} onClick={() => update({ themeColor: c })} title={c}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', background: c, border: active ? `2px solid ${TEXT}` : `1px solid ${BORDER}`, cursor: 'pointer', boxShadow: active ? `0 0 0 2px ${BG}, 0 0 0 3px ${c}` : 'none', transition: 'transform .15s' }} />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── Réseaux sociaux ── */}
                <div style={sectionCard}>
                  <p style={sectionTitle}>● Liens réseaux sociaux</p>
                  <p style={sectionSubtitle}>Affichés dans le footer et utilisés pour les balises de partage.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {socials.map(({ key, label, icon, placeholder, brand }) => {
                      const v = br[key] ?? '';
                      const valid = isValidUrl(v);
                      return (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: BG, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '10px 12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${brand}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, border: `1px solid ${brand}33` }}>{icon}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: TEXT }}>{label}</span>
                              {v && (
                                <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, background: valid ? '#10B98122' : '#EF444422', color: valid ? '#10B981' : '#EF4444', letterSpacing: '0.04em' }}>
                                  {valid ? '✓ VALIDE' : '⚠ URL INVALIDE'}
                                </span>
                              )}
                            </div>
                            <input type="url" value={v} onChange={e => update({ [key]: e.target.value })}
                              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '12px', color: TEXT2, padding: 0 }} placeholder={placeholder} />
                          </div>
                          {valid && (
                            <a href={v} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: '11px', color: GOLD, textDecoration: 'none', padding: '6px 10px', border: `1px solid ${BORDER}`, borderRadius: '6px', fontWeight: 600, flexShrink: 0 }}>
                              Ouvrir ↗
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Save bottom ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px 24px' }}>
                  <span style={{ fontSize: '11px', color: TEXT3 }}>
                    {contentSaved.branding ? '✓ Toutes les modifications sont enregistrées' : 'Modifications non sauvegardées'}
                  </span>
                  <button onClick={save} disabled={contentSaving.branding}
                    style={{ padding: '12px 32px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', background: contentSaved.branding ? S_SAVE_BG : GOLD2, color: contentSaved.branding ? S_SAVE_T : BG, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {getSaveButtonText(contentSaved.branding, contentSaving.branding)}
                  </button>
                </div>
              </div>
            );
}
