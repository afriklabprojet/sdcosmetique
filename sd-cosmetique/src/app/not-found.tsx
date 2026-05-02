import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--off-white)' }}>
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold-pale)' }}>
          404
        </div>
        <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Page introuvable
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--grey-500)' }}>
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <button className="px-8 py-3 text-sm font-medium text-white tracking-widest uppercase" style={{ background: 'var(--gold)' }}>
              Retour à l&apos;accueil
            </button>
          </Link>
          <Link href="/categorie/gammes">
            <button className="px-8 py-3 text-sm font-medium tracking-widest uppercase border" style={{ borderColor: 'var(--grey-200)', color: 'var(--grey-700)' }}>
              Voir les produits
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
