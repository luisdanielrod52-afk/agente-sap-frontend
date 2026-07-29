'use client';

import { useParams } from 'next/navigation';

// Diccionario de traducciones
const translations = {
  es: {
    title: 'Agente SAP HCM',
    subtitle: 'Resuelve dudas de SAP HCM al instante con IA',
    cta: 'Probar gratis',
  },
  en: {
    title: 'SAP HCM Agent',
    subtitle: 'Get instant SAP HCM answers with AI',
    cta: 'Try for free',
  },
};

export default function HomePage() {
  const params = useParams();
  const lang = params.lang as string || 'es';
  const t = translations[lang as keyof typeof translations] || translations.es;

  return (
    <div>
      <h1>{t.title}</h1>
      <p>{t.subtitle}</p>
      <button>{t.cta}</button>
    </div>
  );
}