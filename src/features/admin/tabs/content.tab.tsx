'use client';

/* Onglet «contenu» de la console d'administration. Extrait de `admin.view.tsx` (F-110). */

import React from 'react';
import { TEXT, TEXT3 } from '@/features/admin/admin.constant';

interface ContentTabProps {
  readonly contenutTopSectionsBlock: React.ReactNode;
  readonly trustItemsBlock: React.ReactNode;
}

export default function ContentTab({ contenutTopSectionsBlock, trustItemsBlock }: ContentTabProps) {
  return (
            <div className="space-y-6">
              <h1 className="text-lg font-bold" style={{ color: TEXT }}>Contenu du site</h1>
              <p className="text-xs" style={{ color: TEXT3 }}>Modifiez le contenu visible sur le frontend. Chaque section se sauvegarde indépendamment.</p>

              {contenutTopSectionsBlock}

              {/* ── Barre de confiance ── */}
              {trustItemsBlock}

            </div>
  );
}
