import Link from 'next/link';
import styles from '../static.module.css';
import { getSiteConfig } from '@/lib/site-config.server';

export const metadata = {
  title: 'Politique de confidentialité — SD Cosmétique',
  description: 'Comment nous collectons, utilisons et protégeons vos données personnelles.',
};

export default async function ConfidentialitePage() {
  const cfg = await getSiteConfig();
  const legal = cfg.legal_confidentialite;
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.crumbs}>
            <Link href="/">Accueil</Link>
            <span className={styles.sep}>›</span>
            <span>Confidentialité</span>
          </nav>
          <span className={styles.eyebrow}>{legal.eyebrow || 'Vos données · Notre engagement'}</span>
          <h1 className={styles.title}>{legal.title || 'Confidentialité'}</h1>
          <p className={styles.lede}>
            {legal.lead || 'Vos données personnelles vous appartiennent. Voici précisément ce que nous collectons, pourquoi, et comment vous gardez le contrôle.'}
          </p>
          {legal.updatedAt ? <p className={styles.meta}>{legal.updatedAt}</p> : <p className={styles.meta}>Conforme RGPD</p>}
        </div>
      </section>
      {legal.bodyHtml && legal.bodyHtml.trim() && !legal.bodyHtml.includes('peut être édité') ? (
        <article className={styles.content}><div dangerouslySetInnerHTML={{ __html: legal.bodyHtml }} /></article>
      ) : (
      <article className={styles.content}>
        <nav className={styles.toc}>
          <p className={styles.tocTitle}>Sommaire</p>
          <ul className={styles.tocList}>
            <li><a href="#responsable">1. Responsable du traitement</a></li>
            <li><a href="#donnees">2. Données collectées</a></li>
            <li><a href="#finalites">3. Finalités</a></li>
            <li><a href="#base">4. Base légale</a></li>
            <li><a href="#duree">5. Durée de conservation</a></li>
            <li><a href="#destinataires">6. Destinataires</a></li>
            <li><a href="#droits">7. Vos droits</a></li>
            <li><a href="#cookies">8. Cookies</a></li>
            <li><a href="#securite">9. Sécurité</a></li>
            <li><a href="#contact">10. Contact DPO</a></li>
          </ul>
        </nav>

        <h2 id="responsable">1. Responsable du traitement</h2>
        <p>
          Le responsable du traitement de vos données est <strong>SD Cosmétique SAS</strong>,
          18 rue de Charonne, 75011 Paris, France.
        </p>

        <h2 id="donnees">2. Données collectées</h2>
        <p>Nous collectons uniquement les données strictement nécessaires&nbsp;:</p>
        <ul>
          <li><strong>Identité</strong> · prénom, nom, date de naissance (facultative)</li>
          <li><strong>Contact</strong> · adresse email, téléphone, adresse postale</li>
          <li><strong>Compte</strong> · mot de passe (chiffré bcrypt), préférences beauté</li>
          <li><strong>Commande</strong> · historique d&apos;achats, panier, favoris</li>
          <li><strong>Navigation</strong> · pages consultées, type d&apos;appareil (anonymisé)</li>
        </ul>
        <div className={styles.callout}>
          <p>
            <strong>Aucune donnée bancaire n&apos;est stockée par SD Cosmétique.</strong> Le paiement
            est traité par Stripe (PCI-DSS niveau 1).
          </p>
        </div>

        <h2 id="finalites">3. Finalités du traitement</h2>
        <ul>
          <li>Gestion de votre compte et de vos commandes</li>
          <li>Livraison et service après-vente</li>
          <li>Recommandations personnalisées (avec votre consentement)</li>
          <li>Newsletter et communications commerciales (opt-in)</li>
          <li>Amélioration du site (analytics anonymisés)</li>
          <li>Respect de nos obligations légales (comptabilité, fiscalité)</li>
        </ul>

        <h2 id="base">4. Base légale</h2>
        <p>
          Selon le traitement, nous nous appuyons sur l&apos;<strong>exécution du contrat</strong>
          (commandes), votre <strong>consentement explicite</strong> (newsletter, cookies non essentiels),
          notre <strong>intérêt légitime</strong> (sécurité, prévention de la fraude), ou nos{' '}
          <strong>obligations légales</strong> (facturation, comptabilité).
        </p>

        <h2 id="duree">5. Durée de conservation</h2>
        <ul>
          <li><strong>Compte client</strong> · jusqu&apos;à suppression par vos soins (puis archivage 3 ans)</li>
          <li><strong>Commandes</strong> · 10 ans (obligation comptable)</li>
          <li><strong>Newsletter</strong> · jusqu&apos;à désabonnement</li>
          <li><strong>Cookies analytiques</strong> · 13 mois maximum</li>
        </ul>

        <h2 id="destinataires">6. Destinataires</h2>
        <p>Vos données ne sont jamais vendues. Elles sont partagées uniquement avec&nbsp;:</p>
        <ul>
          <li>Nos transporteurs (Colissimo, DHL) pour la livraison</li>
          <li>Notre prestataire de paiement Stripe pour les transactions</li>
          <li>Notre hébergeur Vercel (Europe)</li>
          <li>Notre outil d&apos;emailing Resend (Europe)</li>
        </ul>
        <p>
          Tous nos sous-traitants sont conformes RGPD et liés par contrat de confidentialité.
        </p>

        <h2 id="droits">7. Vos droits</h2>
        <p>Vous disposez des droits suivants à tout moment&nbsp;:</p>
        <ul>
          <li><strong>Accès</strong> · obtenir une copie de vos données</li>
          <li><strong>Rectification</strong> · corriger des données inexactes</li>
          <li><strong>Effacement</strong> · supprimer votre compte et vos données</li>
          <li><strong>Opposition</strong> · refuser certains traitements</li>
          <li><strong>Portabilité</strong> · récupérer vos données dans un format ouvert</li>
          <li><strong>Limitation</strong> · suspendre temporairement un traitement</li>
        </ul>
        <p>
          Pour exercer vos droits, écrivez-nous à <a href="mailto:dpo@sdcosmetique.com">dpo@sdcosmetique.com</a>.
          Réponse sous 30 jours maximum. Vous pouvez aussi déposer une réclamation auprès de la{' '}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>.
        </p>

        <h2 id="cookies">8. Cookies</h2>
        <p>
          Nous utilisons trois catégories de cookies&nbsp;:
        </p>
        <ul>
          <li><strong>Essentiels</strong> · panier, session (sans consentement requis)</li>
          <li><strong>Analytiques</strong> · Plausible (anonymisé, sans cookie tiers)</li>
          <li><strong>Marketing</strong> · uniquement avec votre consentement explicite</li>
        </ul>

        <h2 id="securite">9. Sécurité</h2>
        <p>
          Vos données sont chiffrées en transit (TLS 1.3) et au repos (AES-256). Les mots de passe
          sont hachés (bcrypt 12 rounds). Nos serveurs sont hébergés en Europe (Francfort).
          Audit de sécurité annuel par cabinet externe.
        </p>

        <h2 id="contact">10. Contact DPO</h2>
        <p>
          Pour toute question relative à vos données personnelles&nbsp;:
        </p>
        <p>
          <strong>Délégué à la Protection des Données</strong><br />
          <a href="mailto:dpo@sdcosmetique.com">dpo@sdcosmetique.com</a><br />
          SD Cosmétique · 18 rue de Charonne · 75011 Paris
        </p>

        <div className={styles.bottomCta}>
          <p className={styles.bottomCtaEyebrow}>Transparence totale</p>
          <h3 className={styles.bottomCtaTitle}>Demandez vos données en un clic</h3>
          <p className={styles.bottomCtaText}>
            Vous pouvez exporter ou supprimer toutes vos données depuis votre espace client.
            Aucune justification requise.
          </p>
          <Link href="/compte" className={styles.bottomCtaBtn}>
            Accéder à mon espace
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </article>
      )}
    </div>
  );
}
