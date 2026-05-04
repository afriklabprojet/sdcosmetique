export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <style>{`
        #site-chrome,
        #site-footer {
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
