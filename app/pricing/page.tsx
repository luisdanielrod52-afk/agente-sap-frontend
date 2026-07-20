'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Plan {
  id: string;
  name: string;
  price: string;
  interval: string;
  features: string[];
  priceId: string | null;
  highlighted: boolean;
  badge?: string;
  buttonText: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratis',
    price: '$0',
    interval: '/mes',
    features: [
      '3 consultas/mes',
      'Documentación básica',
      'Búsqueda en internet',
      'Historial de conversaciones'
    ],
    priceId: null,
    highlighted: false,
    buttonText: 'Comenzar'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    interval: '/mes',
    features: [
      'Consultas ilimitadas',
      'Documentación completa',
      'Búsqueda en internet',
      'Historial de conversaciones',
      'Soporte prioritario'
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || null,
    highlighted: true,
    badge: 'Más popular',
    buttonText: 'Probar gratis'
  },
  {
    id: 'empresa',
    name: 'Empresa',
    price: '$99',
    interval: '/mes',
    features: [
      'Todo lo de Pro',
      'Documentos personalizados',
      'API dedicada',
      'Soporte 24/7',
      'Onboarding incluido'
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_EMPRESA_PRICE_ID || null,
    highlighted: false,
    buttonText: 'Contactar'
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // 🔍 Verificar variables de entorno
  useEffect(() => {
    console.log('🔍 Variables de entorno:', {
      pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
      empresa: process.env.NEXT_PUBLIC_STRIPE_EMPRESA_PRICE_ID,
      api: process.env.NEXT_PUBLIC_API_URL
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
        const response = await axios.get(`${API_URL}/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setCurrentPlan(response.data.plan || 'free');
      } catch (error) {
        console.error('Error obteniendo usuario:', error);
      }
    };
    fetchUser();
  }, [router]);

  const handleSubscribe = async (planId: string, priceId: string | null) => {
    console.log('🔄 handleSubscribe llamado:', { planId, priceId });

    // Plan gratuito → redirigir al chat
    if (planId === 'free') {
      router.push('/chat');
      return;
    }

    // Plan Empresa → mostrar mensaje de contacto
    if (planId === 'empresa') {
      alert('📧 Para el plan Empresa, contáctanos en: ventas@agentesap.com');
      return;
    }

    // Plan Pro → Stripe Checkout
    if (!priceId) {
      console.error('❌ priceId es null o undefined');
      alert('❌ Error: El plan Pro no está configurado correctamente.');
      return;
    }

    console.log('✅ Price ID recibido:', priceId);

    setLoading(planId);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      
      const formData = new URLSearchParams();
      formData.append('price_id', priceId);
      
      const response = await axios.post(
        `${API_URL}/payments/create-checkout`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log('✅ Checkout creado:', response.data);
      window.location.href = response.data.checkout_url;
      
    } catch (error: any) {
      console.error('❌ Error en handleSubscribe:', error);
      alert(error.response?.data?.detail || 'Error al procesar el pago');
    } finally {
      setLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Planes y precios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Elige el plan que mejor se adapte a tus necesidades
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Plan actual: <span className="font-semibold capitalize text-blue-600 dark:text-blue-400">
              {currentPlan}
            </span>
            {currentPlan !== 'free' && (
              <span className="ml-2 text-green-600 dark:text-green-400">✅ Activo</span>
            )}
          </div>
          {currentPlan !== 'free' && (
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
                  const response = await axios.post(
                    `${API_URL}/payments/create-portal-session`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  window.location.href = response.data.portal_url;
                } catch (error) {
                  console.error('Error abriendo portal:', error);
                  alert('Error al abrir el portal de gestión');
                }
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
            >
              📊 Gestionar suscripción
            </button>
          )}
        </div>

        {/* Planes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isDisabled = isCurrent || (plan.id === 'free' && currentPlan !== 'free');
            
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 border transition-all ${
                  plan.highlighted
                    ? 'border-blue-600 shadow-lg scale-105 bg-white dark:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.badge && (
                  <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    {plan.badge}
                  </span>
                )}
                
                {isCurrent && (
                  <span className="inline-block bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 ml-2">
                    ✅ Actual
                  </span>
                )}
                
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {plan.name}
                </h3>
                
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-800 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    {plan.interval}
                  </span>
                </div>
                
                <ul className="mt-6 space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                      <span className="text-green-500">✅</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSubscribe(plan.id, plan.priceId)}
                  disabled={loading === plan.id || isDisabled}
                  className={`w-full mt-6 py-2 rounded-xl font-medium transition-all ${
                    isDisabled
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : plan.id === 'free'
                      ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                      : 'border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id
                    ? '⏳ Procesando...'
                    : isCurrent
                    ? '✅ Plan actual'
                    : plan.buttonText}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>🔒 Pagos seguros con Stripe</p>
          <p className="mt-1">Puedes cancelar tu suscripción en cualquier momento</p>
          <p className="mt-1 text-xs">
            Plan Gratis: 3 consultas/mes · Plan Pro: consultas ilimitadas · Plan Empresa: consultas ilimitadas + API
          </p>
        </div>
      </div>
    </div>
  );
}