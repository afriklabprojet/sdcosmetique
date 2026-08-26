/**
 * Script de réorganisation du panneau admin :
 * Déplace les sections du mega-tab "contenu" vers des onglets dédiés.
 */
import { readFileSync, writeFileSync } from 'fs';

const filePath = new URL('../src/app/admin/AdminDashboard.tsx', import.meta.url).pathname;
let content = readFileSync(filePath, 'utf8');
const original = content;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function applyReplace(label, oldStr, newStr) {
  if (!content.includes(oldStr)) {
    console.error(`❌  [${label}] oldStr NOT FOUND`);
    process.exit(1);
  }
  const count = content.split(oldStr).length - 1;
  if (count > 1) {
    console.error(`❌  [${label}] oldStr matches ${count} times — not unique!`);
    process.exit(1);
  }
  content = content.replace(oldStr, newStr);
  console.log(`✅  [${label}]`);
}

// ─── 1. Tab type ─────────────────────────────────────────────────────────────
applyReplace(
  'Tab type',
  "| 'faq' | 'hero';",
  "| 'faq' | 'hero' | 'legal';"
);

// ─── 2. Sidebar — ajouter item "legal" après "faq" ───────────────────────────
applyReplace(
  'Sidebar legal item',
  `              { id: 'faq',         label: 'FAQ',            desc: 'Questions / Réponses',         icon: '❔', status: 'normal' },
            ] as { id: Tab; label: string; desc: string; icon: string; status: string }[]).map(item => {`,
  `              { id: 'faq',         label: 'FAQ',            desc: 'Questions / Réponses',         icon: '❔', status: 'normal' },
              { id: 'legal',       label: 'Pages légales',  desc: 'CGV, mentions, confidentialité', icon: '📜', status: 'normal' },
            ] as { id: Tab; label: string; desc: string; icon: string; status: string }[]).map(item => {`
);

// ─── 3. Nettoyer le tab "contenu" ────────────────────────────────────────────
// On retire tout depuis {/* ── Témoignages accueil ── */} jusqu'au PROMOS TAB
// en gardant uniquement la fermeture </div>)} du tab contenu.
{
  const removeStart = '\n              {/* ── Témoignages accueil ── */}';
  const nextTabMarker = '\n\n          {/* ─── PROMOS TAB ─── */}';
  const si = content.indexOf(removeStart);
  const ei = content.indexOf(nextTabMarker, si);
  if (si === -1 || ei === -1) {
    console.error('❌  [Nettoyer contenu tab] Markers not found', { si, ei });
    process.exit(1);
  }
  // Le tab contenu se ferme juste avant le marker du prochain tab :
  //   \n            </div>\n          )}\n\n          {/* ─── PROMOS TAB...
  // On garde ces lignes de fermeture.
  content = content.substring(0, si) + '\n            </div>\n          )}' + content.substring(ei);
  console.log('✅  [Nettoyer contenu tab]');
}

// ─── 4. Temoignages tab — ajouter le bloc testimonials_home ─────────────────
{
  // On ajoute le bloc AVANT la fermeture du tab temoignages
  const temoignagesAnchor = `                );
              })()}
              </div>
            </div>
          )}

          {/* ─── CATEGORIES TAB ─── */}`;

  const testimonialHomeBlock = `                );
              })()}
              </div>

              {/* ── Témoignages affichés en page d'accueil ── */}
              {(() => {
                const save = async () => { await saveConfigSection('testimonials_home', siteContent.testimonials_home); };
                const updThome = (i: number, field: string, val: string) => {
                  const updated = siteContent.testimonials_home.map((x, j) => j === i ? { ...x, [field]: val } : x);
                  setSiteContent({ ...siteContent, testimonials_home: updated });
                };
                return (
                  <div style={{ background: SURFACE, border: \`1px solid \${BORDER}\`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <p className="text-sm font-semibold" style={{ color: GOLD }}>💬 Témoignages (page d&apos;accueil)</p>
                    {siteContent.testimonials_home.map((t, i: number) => (
                      <div key={\`testimonial-home-\${t.name.slice(0,12)}-\${t.text.slice(0,8)}\`} style={{ background: BG, borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <p className="text-xs font-semibold" style={{ color: TEXT2 }}>Témoignage {i + 1}</p>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="text-xs" style={{ color: TEXT3 }}>Nom</span>
                          <input value={t.name} onChange={e => updThome(i, 'name', e.target.value)}
                            style={{ background: SURFACE, border: \`1px solid \${BORDER}\`, borderRadius: '6px', padding: '7px 10px', color: TEXT, fontSize: '12px', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="text-xs" style={{ color: TEXT3 }}>Texte</span>
                          <textarea value={t.text} rows={3} onChange={e => updThome(i, 'text', e.target.value)}
                            style={{ background: SURFACE, border: \`1px solid \${BORDER}\`, borderRadius: '6px', padding: '7px 10px', color: TEXT, fontSize: '12px', resize: 'vertical', outline: 'none' }} />
                        </label>
                        <ImageUpload
                          value={t.avatar}
                          onChange={(url: string) => updThome(i, 'avatar', url)}
                          folder="avatars"
                          label="Photo du client"
                          previewSize={80}
                        />
                      </div>
                    ))}
                    <button onClick={save} disabled={contentSaving.testimonials_home}
                      style={{ alignSelf: 'flex-end', background: contentSaved.testimonials_home ? S_SAVE_BG : GOLD2, color: contentSaved.testimonials_home ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      {getSaveButtonText(contentSaved.testimonials_home, contentSaving.testimonials_home)}
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ─── CATEGORIES TAB ─── */}`;

  if (!content.includes(temoignagesAnchor)) {
    console.error('❌  [Temoignages testimonials_home] anchor not found');
    process.exit(1);
  }
  content = content.replace(temoignagesAnchor, testimonialHomeBlock);
  console.log('✅  [Temoignages testimonials_home]');
}

// ─── 5. Hero tab — ajouter les héros de catégories ──────────────────────────
{
  const heroAnchor = `              {heroSectionBlock}
            </div>
          )}

          {/* ─── PROMOS TAB ─── */}`;

  const heroWithCats = `              {heroSectionBlock}

              {/* ── Héros pages catégories ── */}
              {([
                { key: 'hero_face' as const,               label: '🧴 Hero — Visage',         fields: ['eyebrow','title','titleAccent','lead','image'] as const },
                { key: 'hero_body' as const,               label: '💆 Hero — Corps',          fields: ['eyebrow','title','titleAccent','lead','image'] as const },
                { key: 'hero_gammes' as const,             label: '✨ Hero — Gammes',         fields: ['eyebrow','title','titleAccent','lead','image'] as const },
                { key: 'hero_kits' as const,               label: '🎁 Hero — Kits',          fields: ['eyebrow','title','titleAccent','lead','image','stat1Num','stat1Label','stat2Num','stat2Label','stat3Num','stat3Label'] as const },
                { key: 'hero_duo' as const,                label: '👥 Hero — Duo',           fields: ['eyebrow','title','titleAccent','lead','image','synergyNum','synergyText'] as const },
                { key: 'hero_quiz' as const,               label: '📋 Hero — Quiz Teint',    fields: ['eyebrow','title','titleAccent','lead','image','floaterLabel','floaterText'] as const },
                { key: 'hero_teint_noir' as const,         label: '🖤 Hero — Teint Noir',    fields: ['image'] as const },
                { key: 'hero_teint_marron' as const,       label: '🤎 Hero — Teint Marron',  fields: ['image'] as const },
                { key: 'hero_teint_marron_clair' as const, label: '🧡 Hero — Teint Marron Clair', fields: ['image'] as const },
                { key: 'hero_teint_clair' as const,        label: '🤍 Hero — Teint Clair',   fields: ['image'] as const },
                { key: 'hero_teint_metisse' as const,      label: '💛 Hero — Teint Métisse', fields: ['image'] as const },
              ] as const).map(({ key, label, fields }) => {
                const fieldLabels: Record<string, string> = {
                  eyebrow: 'Accroche (texte au-dessus du titre)',
                  title: 'Titre principal',
                  titleAccent: 'Titre — partie accentuée (dorée)',
                  lead: 'Description / sous-titre',
                  image: 'Image (chemin ex: /categories/visage.png)',
                  stat1Num: 'Stat 1 — chiffre', stat1Label: 'Stat 1 — label',
                  stat2Num: 'Stat 2 — chiffre', stat2Label: 'Stat 2 — label',
                  stat3Num: 'Stat 3 — chiffre', stat3Label: 'Stat 3 — label',
                  synergyNum: 'Synergy — nombre (ex: 1 + 1)',
                  synergyText: 'Synergy — résultat (ex: résultats en 14 jours)',
                  floaterLabel: 'Floater — label',
                  floaterText: 'Floater — texte citation',
                };
                const save = async () => { await saveConfigSection(key, siteContent[key]); };
                const f = siteContent[key] as Record<string, string>;
                return (
                  <div key={key} style={{ background: SURFACE, border: \`1px solid \${BORDER}\`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p className="text-sm font-semibold" style={{ color: GOLD }}>{label}</p>
                    {(fields as readonly string[]).filter(f2 => f2 !== 'image').map(field => (
                      <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className="text-xs" style={{ color: TEXT2 }}>{fieldLabels[field] ?? field}</span>
                        {field === 'lead' || field === 'floaterText' ? (
                          <textarea
                            rows={3}
                            value={f[field] ?? ''}
                            onChange={(e) => setSiteContent({ ...siteContent, [key]: { ...(siteContent[key] as Record<string, unknown>), [field]: e.target.value } })}
                            style={{ background: BG, border: \`1px solid \${BORDER}\`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', resize: 'vertical', outline: 'none' }}
                          />
                        ) : (
                          <input
                            value={f[field] ?? ''}
                            onChange={(e) => setSiteContent({ ...siteContent, [key]: { ...(siteContent[key] as Record<string, unknown>), [field]: e.target.value } })}
                            style={{ background: BG, border: \`1px solid \${BORDER}\`, borderRadius: '6px', padding: '8px 12px', color: TEXT, fontSize: '13px', outline: 'none' }}
                          />
                        )}
                      </label>
                    ))}
                    <ImageUpload
                      value={f.image ?? ''}
                      onChange={(url: string) => setSiteContent({ ...siteContent, [key]: { ...(siteContent[key] as Record<string, unknown>), image: url } })}
                      folder="categories"
                      label="Image du hero"
                      previewSize={140}
                    />
                    <button onClick={save} disabled={contentSaving[key]}
                      style={{ alignSelf: 'flex-end', background: contentSaved[key] ? S_SAVE_BG : GOLD2, color: contentSaved[key] ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      {getSaveButtonText(contentSaved[key], contentSaving[key])}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── PROMOS TAB ─── */}`;

  if (!content.includes(heroAnchor)) {
    console.error('❌  [Hero cats] anchor not found');
    process.exit(1);
  }
  content = content.replace(heroAnchor, heroWithCats);
  console.log('✅  [Hero cats]');
}

// ─── 6. Newsletter tab — ajouter config affichage ───────────────────────────
{
  const newsletterAnchor = `                <div>
                    <h1 className="text-lg font-bold" style={{ color: TEXT }}>Newsletter</h1>
                    <p className="text-xs" style={{ color: TEXT3 }}>Gérer les abonnés à la newsletter.</p>
                  </div>`;

  const newsletterWithConfig = `                {/* ─── Newsletter (configuration affichage) ─── */}
                {(() => {
                  const n = siteContent.newsletter;
                  const update = (patch: Partial<typeof n>) => setSiteContent((c: SiteConfig) => ({ ...c, newsletter: { ...c.newsletter, ...patch } }));
                  const save = async () => { await saveConfigSection('newsletter', n); };
                  return (
                    <div style={{ background: SURFACE, border: \`1px solid \${BORDER}\`, borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <h3 style={{ color: TEXT, fontSize: '14px', fontWeight: 700 }}>Newsletter — Affichage</h3>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: TEXT2 }}>
                        <input type="checkbox" checked={n.enabled} onChange={e => update({ enabled: e.target.checked })} id="newsletter-enabled" />{' '}Afficher le bloc newsletter
                      </label>
                      {(['title', 'subtitle', 'ctaLabel', 'successMessage'] as const).map(k => (
                        <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</span>
                          <input value={n[k]} onChange={e => update({ [k]: e.target.value } as Partial<typeof n>)}
                            style={{ background: SURFACE2, color: TEXT, border: \`1px solid \${BORDER2}\`, borderRadius: '4px', padding: '7px 10px', fontSize: '12px' }} />
                        </div>
                      ))}
                      <button onClick={save} disabled={contentSaving.newsletter}
                        style={{ alignSelf: 'flex-end', background: contentSaved.newsletter ? S_SAVE_BG : GOLD2, color: contentSaved.newsletter ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        {getSaveButtonText(contentSaved.newsletter, contentSaving.newsletter)}
                      </button>
                    </div>
                  );
                })()}

                <div>
                    <h1 className="text-lg font-bold" style={{ color: TEXT }}>Newsletter</h1>
                    <p className="text-xs" style={{ color: TEXT3 }}>Gérer les abonnés à la newsletter.</p>
                  </div>`;

  if (!content.includes(newsletterAnchor)) {
    console.error('❌  [Newsletter config] anchor not found');
    process.exit(1);
  }
  content = content.replace(newsletterAnchor, newsletterWithConfig);
  console.log('✅  [Newsletter config]');
}

// ─── 7. Nouveau tab "legal" — insérer avant PROMOS TAB ──────────────────────
{
  const promoTabMarker = `          {/* ─── PROMOS TAB ─── */}
          {tab === 'faq' && (() => {`;

  const legalTabAndPromo = `          {/* ─── LEGAL TAB ─── */}
          {tab === 'legal' && (
            <div className="space-y-6">
              <h1 className="text-lg font-bold" style={{ color: TEXT }}>📜 Pages légales</h1>
              <p className="text-xs" style={{ color: TEXT3 }}>Gérez le contenu des pages légales du site.</p>
              {(() => {
                const KEYS = [
                  { key: 'legal_mentions' as const, label: 'Mentions légales', slug: 'mentions-legales' },
                  { key: 'legal_cgv' as const, label: 'CGV', slug: 'cgv' },
                  { key: 'legal_confidentialite' as const, label: 'Confidentialité', slug: 'confidentialite' },
                  { key: 'legal_engagements' as const, label: 'Engagements', slug: 'engagements' },
                  { key: 'legal_contact' as const, label: 'Contact', slug: 'contact' },
                ];
                return (
                  <div style={{ background: SURFACE, border: \`1px solid \${BORDER}\`, borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p style={{ color: TEXT3, fontSize: '11px' }}>
                      Édite l&apos;eyebrow, le titre, l&apos;intro, la date de mise à jour et un éventuel bloc HTML. Si tu laisses bodyHtml vide, la page conserve son contenu rédactionnel par défaut.
                    </p>
                    {KEYS.map(({ key, label, slug }) => {
                      const lp = siteContent[key];
                      const update = (patch: Partial<typeof lp>) => setSiteContent({ ...siteContent, [key]: { ...siteContent[key], ...patch } } as SiteConfig);
                      const save = () => saveConfigSection(key, lp);
                      const handleLpField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        update({ [e.currentTarget.dataset.k as string]: e.currentTarget.value } as Partial<typeof lp>);
                      return (
                        <details key={key} style={{ border: \`1px solid \${BORDER}\`, borderRadius: '6px', padding: '10px 12px', background: SURFACE2 }}>
                          <summary style={{ cursor: 'pointer', color: GOLD, fontSize: '12px', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <span>{label}</span>
                            <a href={\`/\${slug}\`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              style={{ fontSize: '10px', color: TEXT3, textDecoration: 'none', border: \`1px solid \${BORDER2}\`, padding: '2px 8px', borderRadius: '4px' }}>
                              Aperçu ↗
                            </a>
                          </summary>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                            {(['eyebrow', 'title', 'lead', 'updatedAt'] as const).map(k => (
                              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</span>
                                <input value={lp[k] ?? ''} data-k={k} onChange={handleLpField}
                                  style={{ background: SURFACE, color: TEXT, border: \`1px solid \${BORDER2}\`, borderRadius: '4px', padding: '7px 10px', fontSize: '12px' }} />
                              </div>
                            ))}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{ fontSize: '10px', color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>bodyHtml (optionnel — remplace le corps)</span>
                              <textarea value={lp.bodyHtml ?? ''} onChange={e => update({ bodyHtml: e.target.value })} rows={6}
                                style={{ background: SURFACE, color: TEXT, border: \`1px solid \${BORDER2}\`, borderRadius: '4px', padding: '7px 10px', fontSize: '11px', fontFamily: 'monospace', resize: 'vertical' }} />
                            </div>
                            <button onClick={save} disabled={contentSaving[key]}
                              style={{ alignSelf: 'flex-end', background: contentSaved[key] ? S_SAVE_BG : GOLD2, color: contentSaved[key] ? S_SAVE_T : BG, border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                              {getSaveButtonText(contentSaved[key], contentSaving[key])}
                            </button>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ─── PROMOS TAB ─── */}
          {tab === 'faq' && (() => {`;

  if (!content.includes(promoTabMarker)) {
    console.error('❌  [Legal tab] PROMOS TAB marker not found');
    process.exit(1);
  }
  content = content.replace(promoTabMarker, legalTabAndPromo);
  console.log('✅  [Legal tab]');
}

// ─── Écrire le fichier ────────────────────────────────────────────────────────
writeFileSync(filePath, content, 'utf8');
console.log('\n🎉 Toutes les modifications appliquées avec succès!');
console.log(`   Taille avant : ${original.length} chars`);
console.log(`   Taille après : ${content.length} chars`);
