'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './LegalSidebar.module.css';

const GROUPS = [
  {
    label: 'Juridique',
    links: [
      { href: '/mentions-legales', label: 'Mentions légales' },
      { href: '/cgv', label: 'CGV' },
      { href: '/confidentialite', label: 'Confidentialité' },
      { href: '/livraison', label: 'Livraison & retours' },
    ],
  },
  {
    label: 'À propos',
    links: [
      { href: '/notre-histoire', label: 'Notre histoire' },
      { href: '/engagements', label: 'Engagements' },
      { href: '/ingredients', label: 'Ingrédients' },
      { href: '/faq', label: 'FAQ' },
      { href: '/contact', label: 'Contact' },
    ],
  },
];

export default function LegalSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="Navigation des pages légales">
      <div className={styles.inner}>
        <p className={styles.sideTitle}>Pages du site</p>
        {GROUPS.map((group) => (
          <div key={group.label} className={styles.group}>
            <p className={styles.groupLabel}>{group.label}</p>
            <ul className={styles.list}>
              {group.links.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={active ? `${styles.link} ${styles.linkActive}` : styles.link}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className={styles.linkDot} aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
