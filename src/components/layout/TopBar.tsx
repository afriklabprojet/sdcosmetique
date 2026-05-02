type TopBarProps = {
  message?: string;
  phone?: string;
};

export default function TopBar({
  message = "Livraison rapide partout en Côte d'Ivoire et à l'international",
  phone = '+225 07 49 49 49 49',
}: TopBarProps) {
  return (
    <div
      style={{
        background: '#5A2B0C',
        color: '#F4E8D8',
        fontFamily: 'var(--font-inter), Inter, sans-serif',
        fontSize: '0.78rem',
        padding: '8px 0',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7" />
            <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
          </svg>
          <span>{message}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <span>Besoin d&apos;aide&nbsp;? {phone}</span>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <a href="https://www.facebook.com/sdcosmetique" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9V15h-2.5v-3h2.5V9.7c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 3h-2.3v6.9A10 10 0 0 0 22 12z" /></svg></a>
            <a href="https://www.instagram.com/sdcosmetique" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg></a>
            <a href="https://www.tiktok.com/@sdcosmetique" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8.3a6 6 0 0 1-3.5-1.1v7.4a4.8 4.8 0 1 1-4.8-4.8v2.6a2.2 2.2 0 1 0 2.2 2.2V2h2.5a4 4 0 0 0 3.6 3.6z" /></svg></a>
          </div>
        </div>
      </div>
    </div>
  );
}
