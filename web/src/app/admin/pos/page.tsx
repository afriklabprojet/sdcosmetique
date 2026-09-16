'use client';

import dynamic from 'next/dynamic';

const PosView = dynamic(() => import('@/features/pos/pos.view'), { ssr: false });

export default function PosPage() {
  return <PosView />;
}
