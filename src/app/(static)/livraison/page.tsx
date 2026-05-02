import Link from 'next/link';
import styles from '../static.module.css';

export const metadata = {
  title: 'Livraison & Retours — SD Cosmétique',
  description: 'Délais, tarifs et zones de livraison. Politique de retour 14 jours.',
};

const ZONES = [
  { name: 'France métropolitaine', delay: '2 à 4 jours ouvrés', price: '4,90 €', free: '75 €', carrier: 'Colissimo · suivi inclus' },
  { name: 'Belgique · Suisse · Luxembourg', delay: '3 à 6 jours ouvrés', price: '8,90 €', free: '120 €', carrier: 'DPD · suivi inclus' },
  { name: 'Union Européenne', delay: '4 à 7 jours ouvrés', price: '12,90 €', free: '150 €', carrier: 'DHL Parcel' },
  { name: 'Sénégal · Côte d’Ivoire · Mali', delay: '5 à 8 jours ouvrés', price: '19,90 €', free: '180 €', carrier: 'DHL Express · suivi temps réel' },
  { name: 'Reste de l’Afrique', delay: '7 à 12 jours ouvrés', price: '24,90 €', free: '200 €', carrier: 'DHL Express' },
  { name: 'Reste du monde', delay: '7 à 15 jours ouvrés', price: '29,90 €', free: '250 €', carrier: 'DHL · UPS' },
];

export default function LivraisonPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumbs}>
            <Link href="/">Accueil</Link>
            <span className={styles.sep}>›</span>
            <span>Livraison</span>
          </nav>
          <span className={styles.eyebrow}>Acheminement soigné</span>
          <h1 className={styles.title}>
            Une livraison <span className={styles.titleAccent}>à votre image.</span>
          </h1>
          <p className={styles.lede}>
            Emballage soigné, suivi temps réel et délais maîtrisés — où que vous soyez.
            Notre logistique est pensée pour préserver chaque formule jusqu&apos;à votre porte.
          </p>
        </div>
      </section>

      <article className={styles.content}>
        <h2>Zones &amp; délais de livraison</h2>
        <p>
          Toutes les commandes sont expédiées sous 24 à 48h ouvrées depuis notre atelier de Dakar.
          Vous recevez un email avec le numéro de suivi dès l&apos;expédition.
        </p>

        <div style={{ overflowX: 'auto', margin: '2rem 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#FAF6EE', textAlign: 'left' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1A0E05', borderBottom: '1px solid rgba(143,89,34,0.15)' }}>Zone</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1A0E05', borderBottom: '1px solid rgba(143,89,34,0.15)' }}>Délai</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1A0E05', borderBottom: '1px solid rgba(143,89,34,0.15)' }}>Tarif</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1A0E05', borderBottom: '1px solid rgba(143,89,34,0.15)' }}>Offerte dès</th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map((z) => (
                <tr key={z.name} style={{ borderBottom: '1px solid rgba(26,14,5,0.06)' }}>
                  <td style={{ padding: '1rem', color: '#1A0E05' }}>
                    <strong style={{ fontWeight: 500 }}>{z.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(26,14,5,0.55)', marginTop: 4 }}>{z.carrier}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'rgba(26,14,5,0.78)' }}>{z.delay}</td>
                  <td style={{ padding: '1rem', color: 'rgba(26,14,5,0.78)' }}>{z.price}</td>
                  <td style={{ padding: '1rem', color: '#8F5922', fontWeight: 500 }}>{z.free}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.callout}>
          <p>
            <strong>Click &amp; Collect Dakar</strong> · gratuit en 2h dans notre atelier Almadies,
            du mardi au samedi de 10h à 19h.
          </p>
        </div>

        <h2>Suivi de votre commande</h2>
        <p>
          Dès l&apos;expédition, vous recevez un email contenant un lien de suivi en temps réel.
          Vous pouvez également suivre votre commande depuis votre <Link href="/compte">espace personnel</Link>.
        </p>

        <h2>Politique de retour</h2>
        <p>
          Conformément à la réglementation européenne, vous disposez de <strong>14 jours</strong> à
          compter de la réception pour retourner un produit. Les conditions sont simples&nbsp;:
        </p>
        <ul>
          <li>Produits non ouverts, dans leur emballage d&apos;origine</li>
          <li>Étiquettes et sceaux intacts</li>
          <li>Étiquette de retour téléchargeable depuis votre espace</li>
        </ul>
        <p>
          Une fois le retour réceptionné, le remboursement est effectué sous <strong>14 jours</strong>{' '}
          sur le moyen de paiement initial. Les frais de retour sont à la charge du client, sauf en
          cas de défaut produit ou erreur de notre part.
        </p>

        <h2>Emballage &amp; éco-responsabilité</h2>
        <p>
          Nous utilisons exclusivement du carton recyclé certifié FSC, du papier de soie sans
          chlore, et bannissons tout plastique à usage unique. Nos calages sont en fibres végétales
          biodégradables.
        </p>

        <div className={styles.bottomCta}>
          <p className={styles.bottomCtaEyebrow}>Une question logistique ?</p>
          <h3 className={styles.bottomCtaTitle}>Notre équipe livraison vous répond</h3>
          <p className={styles.bottomCtaText}>
            Délais spécifiques, livraison entreprise, gros volume&nbsp;? Nous étudions chaque
            demande individuellement.
          </p>
          <Link href="/contact" className={styles.bottomCtaBtn}>
            Contacter l&apos;équipe
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </article>
    </div>
  );
}
