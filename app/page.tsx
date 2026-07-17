'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ========== HEADER ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-gray-800">
                Agente <span className="text-blue-600">SAP</span> HCM
              </span>
            </Link>

            {/* Navegación */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#beneficios" className="hover:text-blue-600 transition-colors">Beneficios</a>
              <a href="#como-funciona" className="hover:text-blue-600 transition-colors">Cómo funciona</a>
              <a href="#precios" className="hover:text-blue-600 transition-colors">Precios</a>
            </nav>

            {/* Botones */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <Link
                  href="/chat"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl"
                >
                  Ir al Chat
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl"
                  >
                    Probar gratis
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            🚀 Lanzamiento
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Tu experto en{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SAP HCM
            </span>{' '}
            con IA
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Resuelve dudas de nómina, infotipos y configuración de SAP HCM al instante.
            Tu documentación técnica, ahora conversacional.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/registro"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-xl hover:shadow-2xl text-lg"
            >
              🚀 Comenzar ahora
            </Link>
            <a
              href="#como-funciona"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all font-medium text-lg"
            >
              Ver demo
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Sin tarjeta de crédito • 10 consultas gratis • Acceso inmediato
          </p>
        </div>
      </section>

      {/* ========== BENEFICIOS ========== */}
      <section id="beneficios" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              ¿Por qué usar el Agente SAP HCM?
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Transforma tu documentación técnica en respuestas inmediatas
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">IA entrenada para SAP</h3>
              <p className="text-gray-500 leading-relaxed">
                Modelo especializado en SAP HCM, no respuestas genéricas.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-3xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Tu documentación</h3>
              <p className="text-gray-500 leading-relaxed">
                Conoce tus manuales, guías y OSS Notes específicas.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Información actualizada</h3>
              <p className="text-gray-500 leading-relaxed">
                Busca en internet cuando no encuentres algo en tu documentación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CÓMO FUNCIONA ========== */}
      <section id="como-funciona" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Cómo funciona
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Tres pasos para tener respuestas inmediatas
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Sube tu documentación</h3>
              <p className="text-gray-500">Carga tus manuales y guías de SAP HCM.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Haz preguntas en lenguaje natural</h3>
              <p className="text-gray-500">Pregunta como si hablaras con un experto.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Recibe respuestas accionables</h3>
              <p className="text-gray-500">Con transacciones, tablas y pasos detallados.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PRECIOS ========== */}
      <section id="precios" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Planes</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tus necesidades
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan Gratis */}
            <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800">Gratis</h3>
              <p className="text-4xl font-bold text-gray-900 mt-4">$0 <span className="text-base font-normal text-gray-500">/mes</span></p>
              <ul className="mt-6 space-y-3 text-gray-600">
                <li>✅ 10 consultas/mes</li>
                <li>✅ Documentación básica</li>
                <li>✅ Búsqueda en internet</li>
                <li>❌ Historial de conversaciones</li>
                <li>❌ Soporte prioritario</li>
              </ul>
              <Link
                href="/registro"
                className="block w-full mt-8 py-3 text-center border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Comenzar
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="border-2 border-blue-600 rounded-2xl p-8 shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                Más popular
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Pro</h3>
              <p className="text-4xl font-bold text-gray-900 mt-4">$29 <span className="text-base font-normal text-gray-500">/mes</span></p>
              <ul className="mt-6 space-y-3 text-gray-600">
                <li>✅ Consultas ilimitadas</li>
                <li>✅ Documentación completa</li>
                <li>✅ Búsqueda en internet</li>
                <li>✅ Historial de conversaciones</li>
                <li>✅ Soporte prioritario</li>
              </ul>
              <Link
                href="/registro"
                className="block w-full mt-8 py-3 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                Probar gratis
              </Link>
            </div>

            {/* Plan Empresa */}
            <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800">Empresa</h3>
              <p className="text-4xl font-bold text-gray-900 mt-4">$99 <span className="text-base font-normal text-gray-500">/mes</span></p>
              <ul className="mt-6 space-y-3 text-gray-600">
                <li>✅ Todo lo de Pro</li>
                <li>✅ Documentos personalizados</li>
                <li>✅ API dedicada</li>
                <li>✅ Soporte 24/7</li>
                <li>✅ Onboarding incluido</li>
              </ul>
              <a
                href="#"
                className="block w-full mt-8 py-3 text-center border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors font-medium"
              >
                Contactar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-white">Agente SAP HCM</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Contacto</a>
          </div>
          <p className="text-sm">© 2026 Agente SAP HCM. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}