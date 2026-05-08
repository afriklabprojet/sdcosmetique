'use client';
/**
 * ClientOnlyOverlays
 * Wrapper Client Component permettant d'utiliser `ssr: false` avec next/dynamic
 * depuis le RootLayout (Server Component).
 * CartDrawer et WelcomePopup sont purement client-side (accès window/localStorage).
 */
import dynamic from 'next/dynamic';
import type { WelcomePopup } from '@/lib/config/types';

const CartDrawer = dynamic(() => import('./CartDrawer'), { ssr: false });
const WelcomePopupModal = dynamic(() => import('../marketing/WelcomePopup'), { ssr: false });

interface ClientOnlyOverlaysProps {
  welcomePopup?: WelcomePopup;
}

export default function ClientOnlyOverlays({ welcomePopup }: Readonly<ClientOnlyOverlaysProps>) {
  return (
    <>
      <CartDrawer />
      {welcomePopup?.enabled && <WelcomePopupModal config={welcomePopup} />}
    </>
  );
}
