'use client';
/**
 * ClientOnlyOverlays
 * Wrapper Client Component permettant d'utiliser `ssr: false` avec next/dynamic
 * depuis le RootLayout (Server Component).
 * CartDrawer et WelcomePopup sont purement client-side (accès window/localStorage).
 */
import dynamic from 'next/dynamic';
import type { WelcomePopup } from '@/features/site-config/site-config.type';

const CartDrawer = dynamic(() => import('@/features/cart/drawers/cart.drawer'), { ssr: false });
const WelcomePopupModal = dynamic(() => import('@/features/marketing/welcome.modal'), { ssr: false });

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
