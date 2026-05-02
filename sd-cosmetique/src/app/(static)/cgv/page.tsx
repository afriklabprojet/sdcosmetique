import Link from 'next/link';
import styles from '../static.module.css';
import { getSiteConfig } from '@/lib/site-config.server';

export const metadata = {
  title: 'Conditions Générales de Vente — SD Cosmétique',
  description: 'Conditions générales de vente de SD Cosmétique.',
};

export default async function CGVPage() {
  const cfg = await getSiteConfig();
  const legal = cfg.legal_cgv;
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumbs}>
            <Link href="/">Accueil</Link>
            <span className={styles.sep}>›</span>
            <span>Conditions générales</span>
          </nav>
          <span className={styles.eyebrow}>{legal.eyebrow || 'Mentions juridiques'}</span>
          <h1 className={styles.title}>{legal.title || 'CGV'}</h1>
          <p className={styles.lede}>
            {legal.lead || 'Le cadre clair et transparent qui régit chaque commande passée sur sdcosmetique.com.'}
          </p>
          {legal.updatedAt ? <p className={styles.meta}>Dernière mise à jour · {legal.updatedAt}</p> : null}
        </div>
      </section>
      {legal.bodyHtml && legal.bodyHtml.trim() && !legal.bodyHtml.includes('peut être édité') ? (
        <article className={styles.content}><div dangerouslySetInnerHTML={{ __html: legal.bodyHtml }} /></article>
      ) : null}

      <article className={styles.content}>
        <nav className={styles.toc}>
          <p className={styles.tocTitle}>Sommaire</p>
          <ul className={styles.tocList}>
            <li><a href="#preambule">1. Préambule</a></li>
            <li><a href="#produits">2. Produits</a></li>
            <li><a href="#commande">3. Commande</a></li>
            <li><a href="#prix">4. Prix & Paiement</a></li>
            <li><a href="#livraison">5. Livraison</a></li>
            <li><a href="#retour">6. Retour & Remboursement</a></li>
            <li><a href="#garantie">7. Garanties</a></li>
            <li><a href="#responsabilite">8. Responsabilité</a></li>
            <li><a href="#donnees">9. Données personnelles</a></li>
            <li><a href="#litige">10. Droit applicable</a></li>
          </ul>
        </nav>

        <h2 id="preambule">1. Préambule</h2>
        <p>
          Les présentes conditions générales de vente (CGV) s&apos;appliquent à toutes les ventes
          conclues sur le site <strong>sdcosmetique.com</strong>, édité par la société <strong>SD Cosmétique</strong>,
          SAS au capital de 50 000 €, immatriculée au RCS de Paris sous le numéro 902 345 678,
          dont le siège social est situé 18 rue de Charonne, 75011 Paris.
        </p>
        <p>
          Toute commande passée sur le site implique l&apos;acceptation pleine et entière des présentes CGV.
        </p>

        <h2 id="produits">2. Produits</h2>
        <p>
          Les produits proposés sont décrits avec la plus grande précision possible. Les photographies
          ont une valeur indicative et ne constituent pas un engagement contractuel sur l&apos;aspect exact
          du produit. Les compositions complètes sont fournies sur chaque fiche produit.
        </p>
        <p>
          Nos formules sont fabriquées en France selon les normes cosmétiques européennes en vigueur.
        </p>

        <h2 id="commande">3. Commande</h2>
        <p>
          La commande est validée après acceptation du paiement. Un email de confirmation est
          immédiatement envoyé à l&apos;adresse fournie. SD Cosmétique se réserve le droit d&apos;annuler
          toute commande pour motif légitime (rupture de stock, suspicion de fraude, adresse invalide).
        </p>

        <h2 id="prix">4. Prix & Paiement</h2>
        <p>
          Les prix sont indiqués en euros toutes taxes comprises (TTC), hors frais de livraison.
          Les moyens de paiement acceptés sont&nbsp;:
        </p>
        <ul>
          <li>Carte bancaire (Visa, Mastercard, American Express)</li>
          <li>Wave, Orange Money, MTN MoMo, Moov Money</li>
          <li>Apple Pay, Google Pay</li>
          <li>Virement bancaire (sur demande)</li>
        </ul>
        <p>
          Le paiement est sécurisé via notre partenaire <strong>Stripe</strong>, certifié PCI-DSS niveau 1.
          Aucune donnée bancaire n&apos;est stockée sur nos serveurs.
        </p>

        <h2 id="livraison">5. Livraison</h2>
        <p>
          Les délais de livraison varient selon la zone&nbsp;:
        </p>
        <ul>
          <li><strong>France métropolitaine</strong> · 2 à 4 jours ouvrés (Colissimo)</li>
          <li><strong>Europe</strong> · 4 à 7 jours ouvrés</li>
          <li><strong>Afrique de l&apos;Ouest</strong> · 5 à 10 jours ouvrés (DHL Express)</li>
          <li><strong>Reste du monde</strong> · 7 à 15 jours ouvrés</li>
        </ul>
        <div className={styles.callout}>
          <p>
            <strong>Livraison offerte</strong> dès 75 € d&apos;achat en France métropolitaine,
            150 € à l&apos;international.
          </p>
        </div>

        <h2 id="retour">6. Retour & Remboursement</h2>
        <p>
          Conformément à l&apos;article L221-18 du Code de la consommation, vous disposez d&apos;un délai
          de <strong>14 jours</strong> à compter de la réception pour exercer votre droit de rétractation,
          sans avoir à motiver votre décision.
        </p>
        <p>
          Les produits doivent être retournés dans leur emballage d&apos;origine, non ouverts et non utilisés.
          Le remboursement intervient sous 14 jours après réception du retour, sur le moyen de paiement initial.
        </p>

        <h2 id="garantie">7. Garanties</h2>
        <p>
          Tous nos produits bénéficient des garanties légales de conformité (articles L217-4 à L217-12
          du Code de la consommation) et contre les vices cachés (articles 1641 à 1648 du Code civil).
        </p>

        <h2 id="responsabilite">8. Responsabilité</h2>
        <p>
          SD Cosmétique ne saurait être tenue responsable des dommages résultant d&apos;une mauvaise
          utilisation des produits ou du non-respect des indications figurant sur les emballages.
          En cas d&apos;allergie connue, un test cutané est recommandé avant toute première utilisation.
        </p>

        <h2 id="donnees">9. Données personnelles</h2>
        <p>
          Le traitement de vos données personnelles est encadré par notre{' '}
          <Link href="/confidentialite">politique de confidentialité</Link>, conforme au RGPD.
        </p>

        <h2 id="litige">10. Droit applicable & Médiation</h2>
        <p>
          Les présentes CGV sont régies par le droit français. En cas de litige, vous pouvez recourir
          gratuitement au service de médiation <strong>FEVAD</strong> (60 rue La Boétie, 75008 Paris).
          À défaut, les tribunaux français seront seuls compétents.
        </p>

        <div className={styles.bottomCta}>
          <p className={styles.bottomCtaEyebrow}>Une question ?</p>
          <h3 className={styles.bottomCtaTitle}>Notre équipe vous accompagne</h3>
          <p className={styles.bottomCtaText}>
            Toute interrogation sur votre commande, nos formules ou nos engagements&nbsp;? Nous vous
            répondons en moins de 24h ouvrées.
          </p>
          <Link href="/contact" className={styles.bottomCtaBtn}>
            Nous contacter
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
