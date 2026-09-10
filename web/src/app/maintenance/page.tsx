import type { Metadata } from 'next';
import Image from 'next/image';
import styles from './maintenance.module.css';

export const metadata: Metadata = {
  title: 'Site en maintenance — SD Cosmétique',
  robots: { index: false, follow: false },
};

const TONES = ['var(--skin-noir)', 'var(--skin-marron)', 'var(--skin-marron-clair)', 'var(--skin-clair)', 'var(--skin-metisse)'];

type MaintenanceData = {
  message: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
};

async function fetchMaintenanceData(): Promise<MaintenanceData> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const fallback: MaintenanceData = {
    message: '',
    logoUrl: '/logo.svg',
    contactEmail: 'contact@sdcosmetique.ci',
    contactPhone: '+225 07 49 49 49 49',
  };
  if (!base) return fallback;

  const root = base.replace(/\/$/, '');
  const [maintenance, branding, contact] = await Promise.all([
    fetch(`${root}/settings/maintenance`, { next: { revalidate: 30, tags: ['site-config'] } }).then(r => (r.ok ? r.json() : null)).catch(() => null),
    fetch(`${root}/settings/branding`, { next: { revalidate: 60, tags: ['site-config'] } }).then(r => (r.ok ? r.json() : null)).catch(() => null),
    fetch(`${root}/settings/legal_contact`, { next: { revalidate: 60, tags: ['site-config'] } }).then(r => (r.ok ? r.json() : null)).catch(() => null),
  ]);

  const message = maintenance?.data?.value?.message;
  const logoUrl = branding?.data?.value?.logoUrl;
  const contactEmail = contact?.data?.value?.contactEmail;
  const contactPhone = contact?.data?.value?.contactPhone;

  return {
    message: typeof message === 'string' ? message : fallback.message,
    logoUrl: typeof logoUrl === 'string' && logoUrl ? logoUrl : fallback.logoUrl,
    contactEmail: typeof contactEmail === 'string' && contactEmail ? contactEmail : fallback.contactEmail,
    contactPhone: typeof contactPhone === 'string' && contactPhone ? contactPhone : fallback.contactPhone,
  };
}

export default async function MaintenancePage() {
  const { message, logoUrl, contactEmail, contactPhone } = await fetchMaintenanceData();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <Image src={logoUrl} alt="SD Cosmétique" width={64} height={64} priority className={styles.logoMark} unoptimized={logoUrl.startsWith('http')} />
          <div className={styles.logoText}>
            <span className={styles.logoName}>SD Cosmétique</span>
            <span className={styles.logoTagline}>Beauté Africaine de Prestige</span>
          </div>
        </div>

        <div className={styles.toneStrip} aria-hidden="true">
          {TONES.map((color) => <span key={color} style={{ background: color }} />)}
        </div>

        <p className={styles.eyebrow}>Mise à jour en cours</p>
        <h1 className={styles.title}>
          Nous peaufinons votre <span className={styles.titleAccent}>expérience</span>
        </h1>
        <p className={styles.lede}>
          Nous prenons quelques instants pour améliorer votre boutique.
          Merci de votre douceur — nous serons de retour très vite.
        </p>

        {message && (
          <div className={styles.callout}>
            <p>{message}</p>
          </div>
        )}

        <div className={styles.contact}>
          <p className={styles.contactLabel}>Besoin d&apos;aide entre-temps ?</p>
          <div className={styles.contactLinks}>
            <a href={`tel:${contactPhone.replace(/\s+/g, '')}`}>{contactPhone}</a>
            <span className={styles.sep}>·</span>
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </div>
        </div>

        <p className={styles.footer}>SD Cosmétique — Révélez votre éclat naturel.</p>
      </div>
    </div>
  );
}
