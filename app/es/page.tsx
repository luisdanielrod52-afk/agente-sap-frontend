'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HomePage() {
  const pathname = usePathname();
  const lang = pathname.startsWith('/en') ? 'en' : 'es';

  const translations = {
    es: {
      title: 'Agente SAP HCM',
      subtitle: 'Resuelve dudas de nómina, infotipos y configuración de SAP HCM al instante.',
      cta: 'Probar gratis',
      chat: 'Ir al Chat',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      features: {
        ai: 'IA entrenada para SAP',
        documentation: 'Tu documentación',
        updated: 'Información actualizada'
      },
      users: '100+ consultores activos',
      consultations: '1,200+ consultas resueltas',
      rating: '4.9 / 5 valoración'
    },
    en: {
      title: 'SAP HCM Agent',
      subtitle: 'Get instant answers about payroll, infotypes, and SAP HCM configuration.',
      cta: 'Try for free',
      chat: 'Go to Chat',
      login: 'Login',
      register: 'Register',
      features: {
        ai: 'AI trained for SAP',
        documentation: 'Your documentation',
        updated: 'Updated information'
      },
      users: '100+ active consultants',
      consultations: '1,200+ resolved queries',
      rating: '4.9 / 5 rating'
    }
  };

  const t = translations[lang as keyof typeof translations] || translations.es;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            🚀 Lanzamiento oficial
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
          
          {/* Botones CTA */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={`/${lang}/chat`}>
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                🚀 {t.cta}
              </button>
            </Link>
            <Link href={`/${lang}/login`}>
              <button className="px-8 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                {t.login}
              </button>
            </Link>
          </div>

          {/* Estadísticas */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">100+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.users}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">1,200+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.consultations}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">4.9 ⭐</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.rating}</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{t.features.ai}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Modelo especializado en SAP HCM, no respuestas genéricas.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{t.features.documentation}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Conoce tus manuales, guías y OSS Notes específicas.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{t.features.updated}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Busca en internet cuando no encuentres algo en tu documentación.
            </p>
          </div>
        </div>

        {/* Planes */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Planes y precios
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Elige el plan que mejor se adapte a tus necesidades
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Plan Gratis */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Gratis</h3>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">$0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">/mes</p>
              <ul className="mt-4 space-y-2 text-left">
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">✅ 3 consultas/mes</li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">✅ Documentación básica</li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">✅ Búsqueda en internet</li>
              </ul>
            </div>
            {/* Plan Pro */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl shadow-xl border-2 border-blue-500 dark:border-blue-400">
              <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Más popular</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-2">Pro</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">$120.000</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">/mes</p>
              <ul className="mt-4 space-y-2 text-left">
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">✅ Consultas ilimitadas</li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">✅ Documentación completa</li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">✅ Soporte prioritario</li>
              </ul>
            </div>
            {/* Plan Empresa */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Empresa</h3>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">$400.000</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">/mes</p>
              <ul className="mt-4 space-y-2 text-left">
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">✅ Todo lo de Pro</li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">✅ API dedicada</li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">✅ Soporte 24/7</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>🔒 Pagos seguros con Wompi</p>
          <p className="mt-1">Puedes cancelar tu suscripción en cualquier momento</p>
        </div>
      </div>
    </div>
  );
}