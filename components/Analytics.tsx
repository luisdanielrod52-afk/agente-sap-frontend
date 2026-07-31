'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

// 🔥 Reemplaza con tu ID de medición de Google Analytics
const GA_MEASUREMENT_ID = 'G-ZG7JFLS3K9';

// Declarar gtag para TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 👀 Enviar eventos de página cuando cambia la URL
  useEffect(() => {
    if (pathname && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// 📊 Funciones para eventos personalizados
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

export const trackLogin = (method: string = 'password') => {
  trackEvent('login', { method });
};

export const trackSignup = (plan: string = 'free') => {
  trackEvent('signup', { plan });
};

export const trackChatQuery = (query: string) => {
  trackEvent('chat_query', { query_length: query.length });
};

export const trackPricingView = (plan: string) => {
  trackEvent('view_pricing', { plan });
};

export const trackPaymentStart = (plan: string, amount: number) => {
  trackEvent('begin_checkout', { plan, amount });
};

export const trackPaymentSuccess = (plan: string, amount: number) => {
  trackEvent('purchase', { plan, value: amount, currency: 'COP' });
};