'use client';

import dynamic from 'next/dynamic';

const SalesHistoryView = dynamic(() => import('@/features/pos/history/sales-history.view'), { ssr: false });

export default function PosHistoryPage() {
  return <SalesHistoryView />;
}
