'use client';

import dynamic from 'next/dynamic';

const ClientDetail = dynamic(() => import('@/features/admin/client-detail.view'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0906' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #C8974A', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  ),
});

export default function AdminClientDetailPage() {
  return <ClientDetail />;
}
