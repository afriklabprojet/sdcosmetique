import type { ReactNode } from 'react';
import LegalSidebar from '@/shared/layout/legal.sidebar';
import styles from './static.module.css';

export default function StaticLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className={styles.sideLayout}>
      <LegalSidebar />
      <div className={styles.sideMain}>{children}</div>
    </div>
  );
}
