'use client';

import Link from 'next/link';

const translations = {
  es: {
    title: 'Agente SAP HCM',
    subtitle: 'Resuelve dudas de SAP HCM al instante con IA',
    chat: 'Ir al Chat',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
  },
  en: {
    title: 'SAP HCM Agent',
    subtitle: 'Get instant SAP HCM answers with AI',
    chat: 'Go to Chat',
    login: 'Login',
    register: 'Register',
  },
};

export default function HomePage() {
  const lang = 'es';
  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold text-gray-800 dark:text-white">{t.title}</h1>
        <p className="text-xl mt-4 text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href={`/${lang}/chat`}>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
              {t.chat}
            </button>
          </Link>
          <Link href={`/${lang}/login`}>
            <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
              {t.login}
            </button>
          </Link>
          <Link href={`/${lang}/registro`}>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg hover:shadow-xl">
              {t.register}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}