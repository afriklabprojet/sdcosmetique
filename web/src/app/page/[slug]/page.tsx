import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StorefrontPage } from '@/shared/api/page';
import styles from '../../(static)/static.module.css';

export const revalidate = 60;

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ slug: string }> }>): Promise<Metadata> {
  const { slug } = await params;
  const page = await StorefrontPage.find(slug);
  if (!page) return {};
  return { title: `${page.title} — SD Cosmétique` };
}

export default async function StaticContentPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const page = await StorefrontPage.find(slug);
  if (!page) notFound();

  const paragraphs = page.content.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumbs}>
            <Link href="/">Accueil</Link>
            <span className={styles.sep}>›</span>
            <span>{page.title}</span>
          </nav>
          <h1 className={styles.title}>{page.title}</h1>
        </div>
      </section>

      <div className={styles.content}>
        {paragraphs.length === 0 ? (
          <p>Cette page n&apos;a pas encore de contenu.</p>
        ) : (
          paragraphs.map((block, i) => (
            <p key={i} style={{ whiteSpace: 'pre-line' }}>{block}</p>
          ))
        )}
      </div>
    </div>
  );
}
