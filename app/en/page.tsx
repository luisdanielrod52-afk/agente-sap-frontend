'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HomePage() {
  const pathname = usePathname();
  const lang = pathname.startsWith('/en') ? 'en' : 'es';

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

  const t = translations[lang as keyof typeof translations] || translations.es;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold text-gray-800 dark:text-white">
          {t.title}
        </h1>
        <p className="text-xl mt-4 text-gray-600 dark:text-gray-300">
          {t.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href={`/${lang}/chat`}>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
              {t.chat}
            </button>
          </Link>
          <Link href={`/${lang}/login`}>
            <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
              {t.login}
            </button>
          </Link>
          <Link href={`/${lang}/registro`}>
            <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
              {t.register}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}