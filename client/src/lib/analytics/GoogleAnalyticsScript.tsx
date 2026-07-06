import Script from "next/script";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";

// Belt-and-suspenders: even if the script loads, Ga4AnalyticsAdapter.isEnabled()
// re-checks every condition before each send(). But skipping the script load
// entirely in non-production is the cleaner approach.
export default function GoogleAnalyticsScript() {
  if (!analyticsEnabled || !measurementId || process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
