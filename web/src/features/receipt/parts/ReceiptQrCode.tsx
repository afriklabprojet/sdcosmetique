/** Image générée côté Laravel (§14/§34) — jamais regénérée en JS, jamais de donnée sensible encodée. */
export default function ReceiptQrCode({ qrImage }: { qrImage: string | null }) {
  if (!qrImage) return null;

  return (
    <div style={{ textAlign: 'center', margin: '14px 0' }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- data-URI générée par l'API, pas une image statique */}
      <img src={qrImage} alt="QR code du reçu" style={{ width: '88px', height: '88px' }} />
      <div style={{ fontSize: '10px', color: 'var(--grey-600, #666)', marginTop: '4px' }}>Consultez votre reçu en ligne</div>
    </div>
  );
}
