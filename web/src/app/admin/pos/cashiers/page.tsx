'use client';

import dynamic from 'next/dynamic';

const CashiersView = dynamic(() => import('@/features/pos/cashiers/cashiers.view'), { ssr: false });

export default function CashiersPage() {
  return <CashiersView />;
}