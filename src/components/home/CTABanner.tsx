import React from 'react';
import Link from 'next/link';

export default function CTABanner() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/hero/cta-banner.jpg"
          alt="Femme au teint foncé – SD Cosmetique"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,10,10,0.88) 0%, rgba(143,89,34,0.6) 100%)' }} />
      </div>

      {/* Decorative circles */}
      <div className="absolute top-8 right-16 w-32 h-32 rounded-full border opacity-10" style={{ borderColor: 'var(--gold)' }} />
      <div className="absolute bottom-8 right-8 w-56 h-56 rounded-full border opacity-5" style={{ borderColor: 'var(--gold-muted)' }} />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-px" style={{ background: 'var(--gold-muted)' }} />
          <span className="text-xs tracking-widest uppercase font-medium" style={{ color: 'var(--gold-muted)', letterSpacing: '0.25em' }}>
            Quiz Beauté
          </span>
          <div className="w-12 h-px" style={{ background: 'var(--gold-muted)' }} />
        </div>

        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
          Quel produit est<br />
          <span style={{ color: 'var(--gold-muted)' }}>fait pour vous ?</span>
        </h2>

        <p className="text-base text-white/70 mb-10 leading-relaxed">
          En 2 minutes, notre quiz intelligent analyse votre carnation et vos besoins pour vous recommander la routine beauté idéale.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/quiz">
            <button
              className="px-12 py-5 text-sm font-medium text-white tracking-widest uppercase transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'var(--gold)', letterSpacing: '0.15em', boxShadow: 'var(--shadow-gold)' }}
            >
              Commencer le quiz →
            </button>
          </Link>
          <Link href="/categorie/gammes">
            <button className="px-12 py-5 text-sm font-medium text-white tracking-widest uppercase border border-white/40 transition-all duration-300 hover:border-white hover:bg-white/10"
              style={{ letterSpacing: '0.15em' }}>
              Voir les gammes
            </button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10">
          {['Gratuit', 'Résultats instantanés', 'Sans inscription'].map(item => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--gold)' }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span className="text-xs text-white/70">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
