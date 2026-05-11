'use client';

/**
 * PromoBadge.tsx — Badge animé pour la promotion globale.
 * Utilise Framer Motion pour l'entrée + pulsation.
 */

import { motion } from 'framer-motion';

interface PromoBadgeProps {
  /** Pourcentage de remise à afficher (ex: 20 → "-20%") */
  discountPct: number;
  /** Libellé alternatif (ex: "SOLDES") — si fourni, s'affiche à la place du pourcentage */
  label?: string;
  /** Couleur de fond (défaut rouge promos) */
  color?: string;
  /** Taille: 'sm' pour ProductCard list, 'md' pour detail */
  size?: 'sm' | 'md';
  className?: string;
}

export function PromoBadge({
  discountPct,
  label,
  color = '#C0392B',
  size = 'sm',
  className,
}: PromoBadgeProps) {
  const isSm = size === 'sm';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 20 }}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color,
        color: '#fff',
        borderRadius: isSm ? 4 : 6,
        padding: isSm ? '2px 6px' : '3px 9px',
        fontSize: isSm ? '0.62rem' : '0.75rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        lineHeight: 1,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        boxShadow: `0 2px 6px ${color}60`,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {label ? label : `-${discountPct}%`}
    </motion.div>
  );
}
