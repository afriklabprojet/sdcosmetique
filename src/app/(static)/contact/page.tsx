'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from '../static.module.css';
import { fetchSiteConfigSection, DEFAULT_SITE_CONFIG, type LegalPage } from '@/lib/site-config';

const SUBJECTS = [
  'Question sur une commande',
  'Conseil produit personnalisé',
  'Service après-vente',
  'Partenariat & Presse',
  'Recrutement',
  'Autre demande',
];

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: SUBJECTS[0], message: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [legal, setLegal] = useState<LegalPage>(DEFAULT_SITE_CONFIG.legal_contact);
  useEffect(() => {
    fetchSiteConfigSection('legal_contact').then(v => v && setLegal(v)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('send_failed');
      setSent(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer ou nous contacter par email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumbs}>
            <Link href="/">Accueil</Link>
            <span className={styles.sep}>›</span>
            <span>Contact</span>
          </nav>
          <span className={styles.eyebrow}>{legal.eyebrow || 'Une question · une attention'}</span>
          <h1 className={styles.title}>{legal.title || 'Parlons beauté.'}</h1>
          <p className={styles.lede}>
            {legal.lead || 'Notre équipe vous répond en moins de 24h ouvrées. Posez-nous votre question, nous sommes ravis de vous accompagner.'}
          </p>
          {legal.updatedAt ? <p className={styles.meta}>{legal.updatedAt}</p> : null}
        </div>
      </section>

      <article className={styles.content} style={{ maxWidth: 1080 }}>
        <div className={styles.contactGrid}>
          {/* FORM */}
          <div>
            {sent ? (
              <div className={styles.callout} style={{ marginTop: 0 }}>
                <p style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.2rem', color: '#1A0E05', marginBottom: '0.5rem' }}>
                  Message envoyé avec succès.
                </p>
                <p>
                  Merci <strong>{form.nom}</strong>, nous vous répondons à <strong>{form.email}</strong>{' '}
                  sous 24h ouvrées.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className={styles.formRow}>
                  <Field label="Nom complet" id="nom">
                    <input
                      id="nom"
                      type="text"
                      required
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Adresse e-mail" id="email">
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      style={inputStyle}
                    />
                  </Field>
                </div>

                <Field label="Sujet" id="sujet">
                  <select
                    id="sujet"
                    value={form.sujet}
                    onChange={(e) => setForm({ ...form, sujet: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Votre message" id="message">
                  <textarea
                    id="message"
                    rows={6}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez-nous votre demande en quelques lignes…"
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 140, fontFamily: 'inherit' }}
                  />
                </Field>

                <button type="submit" disabled={submitting} className={styles.submitBtn}>
                  {submitting ? 'Envoi en cours…' : 'Envoyer le message'}
                  {!submitting && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>}
                </button>

                {error && (
                  <p style={{ fontSize: '0.85rem', color: '#b91c1c', margin: 0, lineHeight: 1.6 }}>
                    {error}
                  </p>
                )}

                <p style={{ fontSize: '0.78rem', color: 'rgba(26,14,5,0.5)', margin: 0, lineHeight: 1.6 }}>
                  En envoyant ce formulaire, vous acceptez notre{' '}
                  <Link href="/confidentialite" style={{ color: '#8F5922' }}>politique de confidentialité</Link>.
                </p>
              </form>
            )}
          </div>

          {/* INFO SIDEBAR */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <InfoBlock
              title="Service client"
              items={[
                { label: 'contact@sdcosmetique.com', href: 'mailto:contact@sdcosmetique.com' },
                { label: '+221 33 869 42 18', href: 'tel:+221338694218' },
                { label: 'Lun–Ven · 9h–18h GMT', muted: true },
              ]}
            />
            <InfoBlock
              title="Atelier Dakar"
              items={[
                { label: 'Route des Almadies', muted: true },
                { label: 'BP 21850 · Dakar, Sénégal', muted: true },
                { label: 'Mar–Sam · 10h–19h', muted: true },
              ]}
            />
            <InfoBlock
              title="Presse & Partenariats"
              items={[
                { label: 'presse@sdcosmetique.com', href: 'mailto:presse@sdcosmetique.com' },
                { label: 'partenariats@sdcosmetique.com', href: 'mailto:partenariats@sdcosmetique.com' },
              ]}
            />
          </aside>
        </div>
      </article>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.85rem 1rem',
  fontSize: '0.95rem',
  fontFamily: 'var(--font-inter), Inter, sans-serif',
  color: '#1A0E05',
  background: '#fff',
  border: '1px solid rgba(143, 89, 34, 0.2)',
  borderRadius: '8px',
  outline: 'none',
  transition: 'border-color 0.2s ease',
};



function Field({ label, id, children }: Readonly<{ label: string; id: string; children: React.ReactNode }>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label htmlFor={id} style={{ fontSize: '0.78rem', fontWeight: 500, color: '#1A0E05', letterSpacing: '0.04em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoBlock({
  title,
  items,
}: Readonly<{
  title: string;
  items: { label: string; href?: string; muted?: boolean }[];
}>) {
  return (
    <div style={{ background: '#FAF6EE', borderRadius: 12, padding: '1.5rem 1.5rem' }}>
      <p style={{ fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#8F5922', fontWeight: 600, margin: '0 0 0.75rem' }}>
        {title}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item) => (
          <li key={item.label} style={{ fontSize: '0.9rem', color: item.muted ? 'rgba(26,14,5,0.6)' : '#1A0E05' }}>
            {item.href ? (
              <a href={item.href} style={{ color: '#1A0E05', textDecoration: 'none', borderBottom: '1px solid rgba(143,89,34,0.3)' }}>
                {item.label}
              </a>
            ) : (
              item.label
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
