'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// 🔥 IDs CORRECTOS DE STRIPE
const PRICE_IDS = {
    pro: 'price_1Tuh4J3KqMr5UkoDX74rFjb5',  // ✅ ID CORRECTO
    empresa: 'price_iTuh4oJKqMr5UkoDAEk2FZY0'
};

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [currentPlan, setCurrentPlan] = useState<string>('free');
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

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

    const handleSubscribe = async (planId: string) => {
        console.log('🔄 handleSubscribe:', planId);

        if (planId === 'free') {
            router.push('/chat');
            return;
        }

        if (planId === 'empresa') {
            alert('📧 Contáctanos en: ventas@agentesap.com');
            return;
        }

        const priceId = PRICE_IDS[planId as keyof typeof PRICE_IDS];
        if (!priceId) {
            alert('❌ Error: Plan no configurado');
            return;
        }

        console.log('✅ Price ID:', priceId);

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

            console.log('✅ Checkout URL:', response.data.checkout_url);
            window.location.href = response.data.checkout_url;

        } catch (error: any) {
            console.error('❌ Error:', error);
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
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Planes y precios</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Elige el plan que mejor se adapte a tus necesidades</p>
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Plan actual: <span className="font-semibold capitalize text-blue-600 dark:text-blue-400">{currentPlan}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Gratis */}
                    <div className="rounded-2xl p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Gratis</h3>
                        <div className="mt-4">
                            <span className="text-4xl font-bold text-gray-800 dark:text-white">$0</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">/mes</span>
                        </div>
                        <ul className="mt-6 space-y-2">
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ 3 consultas/mes</li>
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ Documentación básica</li>
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ Búsqueda en internet</li>
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ Historial de conversaciones</li>
                        </ul>
                        <button
                            onClick={() => handleSubscribe('free')}
                            className="w-full mt-6 py-2 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-all"
                        >
                            {currentPlan === 'free' ? '✅ Plan actual' : 'Comenzar'}
                        </button>
                    </div>

                    {/* Pro */}
                    <div className="rounded-2xl p-6 border border-blue-600 shadow-lg scale-105 bg-white dark:bg-gray-800">
                        <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">Más popular</span>
                        {currentPlan === 'pro' && (
                            <span className="inline-block bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 ml-2">✅ Actual</span>
                        )}
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Pro</h3>
                        <div className="mt-4">
                            <span className="text-4xl font-bold text-gray-800 dark:text-white">$29</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">/mes</span>
                        </div>
                        <ul className="mt-6 space-y-2">
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ Consultas ilimitadas</li>
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ Documentación completa</li>
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ Búsqueda en internet</li>
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ Historial de conversaciones</li>
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ Soporte prioritario</li>
                        </ul>
                        <button
                            onClick={() => handleSubscribe('pro')}
                            disabled={loading === 'pro' || currentPlan === 'pro'}
                            className={`w-full mt-6 py-2 rounded-xl font-medium transition-all ${
                                currentPlan === 'pro'
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            } disabled:opacity-50`}
                        >
                            {loading === 'pro' ? '⏳ Procesando...' : currentPlan === 'pro' ? '✅ Plan actual' : 'Probar gratis'}
                        </button>
                    </div>

                    {/* Empresa */}
                    <div className="rounded-2xl p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Empresa</h3>
                        <div className="mt-4">
                            <span className="text-4xl font-bold text-gray-800 dark:text-white">$99</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">/mes</span>
                        </div>
                        <ul className="mt-6 space-y-2">
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ Todo lo de Pro</li>
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ Documentos personalizados</li>
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ API dedicada</li>
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ Soporte 24/7</li>
                            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">✅ Onboarding incluido</li>
                        </ul>
                        <button
                            onClick={() => handleSubscribe('empresa')}
                            disabled={loading === 'empresa' || currentPlan === 'empresa'}
                            className={`w-full mt-6 py-2 rounded-xl font-medium transition-all ${
                                currentPlan === 'empresa'
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            } disabled:opacity-50`}
                        >
                            {loading === 'empresa' ? '⏳ Procesando...' : currentPlan === 'empresa' ? '✅ Plan actual' : 'Contactar'}
                        </button>
                    </div>
                </div>

                <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
                    <p>🔒 Pagos seguros con Stripe</p>
                    <p className="mt-1">Puedes cancelar tu suscripción en cualquier momento</p>
                </div>
            </div>
        </div>
    );
}