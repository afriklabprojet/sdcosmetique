import Script from 'next/script';
import type { MarketingConfig } from '@/lib/site-config';

interface TrackingScriptsProps {
  marketing: MarketingConfig;
}

/**
 * Injecte les scripts de tracking (Facebook Pixel, Google Ads, GTM, TikTok)
 * uniquement si l'ID correspondant est renseigné dans la config admin.
 * Utilise next/script avec strategy="afterInteractive" pour ne pas bloquer le LCP.
 */
export default function TrackingScripts({ marketing }: Readonly<TrackingScriptsProps>) {
  const { facebookPixelId, googleAdsId, googleTagManagerId, tiktokPixelId } = marketing;

  return (
    <>
      {/* ── Google Tag Manager ─────────────────────────────────────────────── */}
      {googleTagManagerId && (
        <>
          <Script id="gtm-head" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');`}
          </Script>
          {/* GTM noscript fallback géré côté layout body */}
        </>
      )}

      {/* ── Google Ads (gTag) ──────────────────────────────────────────────── */}
      {googleAdsId && (
        <>
          <Script
            id="gtag-js"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAdsId}');`}
          </Script>
        </>
      )}

      {/* ── Facebook / Meta Pixel ──────────────────────────────────────────── */}
      {facebookPixelId && (
        <Script id="fb-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${facebookPixelId}');
fbq('track', 'PageView');`}
        </Script>
      )}

      {/* ── TikTok Pixel ──────────────────────────────────────────────────── */}
      {tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="lazyOnload">
          {`!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('${tiktokPixelId}');
  ttq.page();
}(window, document, 'ttq');`}
        </Script>
      )}
    </>
  );
}
