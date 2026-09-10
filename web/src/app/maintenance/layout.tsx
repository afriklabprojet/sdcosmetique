export default function MaintenanceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <style>{`
        #site-chrome,
        #site-footer,
        .bottom-nav {
          display: none !important;
        }
        main.flex-1 {
          padding-top: 0 !important;
        }
      `}</style>
      {children}
    </>
  );
}
