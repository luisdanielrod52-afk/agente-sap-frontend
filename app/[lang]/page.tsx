'use client';

import { useParams } from 'next/navigation';

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
  const lang = params?.lang as string || 'es';
  const t = translations[lang as keyof typeof translations] || translations.es;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">{t.title}</h1>
      <p className="text-xl mt-4">{t.subtitle}</p>
      <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        {t.cta}
      </button>
    </div>
  );
}