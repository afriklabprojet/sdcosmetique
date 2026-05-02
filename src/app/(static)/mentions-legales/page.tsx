import Link from 'next/link';
import styles from '../static.module.css';
import TrustBar from '@/components/home/TrustBar';

export const metadata = {
  title: 'Mentions légales — SD Cosmétique',
  description: 'Mentions légales et informations sur la société SD Cosmétique.',
};

export default function MentionsLegalesPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumbs}>
            <Link href="/">Accueil</Link>
            <span className={styles.sep}>›</span>
            <span>Mentions légales</span>
          </nav>
          <span className={styles.eyebrow}>Informations légales</span>
          <h1 className={styles.title}>
            Mentions <span className={styles.titleAccent}>légales</span>
          </h1>
          <p className={styles.lede}>
            Toutes les informations légales relatives à l&apos;éditeur du site sdcosmetique.com.
          </p>
        </div>
      </section>

      {/* Ajout de la TrustBar */}
      <TrustBar />

      <article className={styles.content}>
        <h2>Éditeur du site</h2>
        <p>
          <strong>SD Cosmétique SAS</strong><br />
          Société par Actions Simplifiée au capital de 50 000 €<br />
          Siège social&nbsp;: 18 rue de Charonne, 75011 Paris, France<br />
          RCS Paris&nbsp;: 902 345 678<br />
          SIRET&nbsp;: 902 345 678 00012<br />
          TVA intracommunautaire&nbsp;: FR 12 902345678<br />
          Capital social&nbsp;: 50 000 €
        </p>

        <h2>Direction de la publication</h2>
        <p>
          <strong>Sarah Diop</strong>, Présidente<br />
          Contact&nbsp;: <a href="mailto:contact@sdcosmetique.com">contact@sdcosmetique.com</a>
        </p>

        <h2>Hébergement</h2>
        <p>
          <strong>Vercel Inc.</strong><br />
          440 N Barranca Ave #4133, Covina, CA 91723, USA<br />
          Site&nbsp;: <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a><br />
          Région d&apos;hébergement&nbsp;: Francfort (Europe)
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble du contenu du site (textes, photographies, logos, marques, illustrations,
          design) est la propriété exclusive de SD Cosmétique SAS ou de ses partenaires, et est
          protégé par le droit d&apos;auteur et le droit des marques.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication ou adaptation de tout ou
          partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite
          sans autorisation écrite préalable.
        </p>

        <h2>Crédits</h2>
        <ul>
          <li>Direction artistique &amp; design&nbsp;: Studio SD</li>
          <li>Photographies&nbsp;: Maïmouna Guèye, Léo Cantori</li>
          <li>Développement&nbsp;: équipe interne SD Cosmétique</li>
          <li>Typographies&nbsp;: Playfair Display (SIL OFL), Inter (SIL OFL)</li>
        </ul>

        <h2>Médiation à la consommation</h2>
        <p>
          Conformément à l&apos;article L612-1 du Code de la consommation, le consommateur peut
          recourir gratuitement au service de médiation&nbsp;:
        </p>
        <p>
          <strong>FEVAD</strong> (Fédération du e-commerce et de la vente à distance)<br />
          60 rue La Boétie, 75008 Paris<br />
          <a href="https://www.fevad.com" target="_blank" rel="noopener noreferrer">fevad.com</a>
        </p>

        <h2>Contact</h2>
        <p>
          Pour toute question, contactez-nous via notre <Link href="/contact">formulaire de contact</Link>{' '}
          ou par email à <a href="mailto:contact@sdcosmetique.com">contact@sdcosmetique.com</a>.
        </p>
      </article>
    </div>
  );
}
