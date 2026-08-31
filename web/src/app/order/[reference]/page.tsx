'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function OrderReturnPage() {
  const router = useRouter();
  const params = useParams<{ reference: string }>();

  useEffect(() => {
    const reference = params.reference;
    router.replace(reference ? `/confirmation?ref=${encodeURIComponent(reference)}` : '/confirmation');
  }, [params.reference, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F5' }}>
      <div className="w-8 h-8 border-2 border-amber-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
