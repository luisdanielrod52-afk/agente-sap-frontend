'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// 🔥 LINKS DE PAGO DE WOMPI
const WOMPI_LINKS = {
    pro: 'https://checkout.wompi.co/l/izyJb4',
    empresa: 'https://checkout.wompi.co/l/Kpt24R'
};

const PLANS = [
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
        highlighted: false,
        buttonText: 'Comenzar'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$120.000 COP',
        interval: '/mes',
        features: [
            'Consultas ilimitadas',
            'Documentación completa',
            'Búsqueda en internet',
            'Historial de conversaciones',
            'Soporte prioritario'
        ],
        highlighted: true,
        badge: 'Más popular',
        buttonText: 'Suscribirse'
    },
    {
        id: 'empresa',
        name: 'Empresa',
        price: '$400.000 COP',
        interval: '/mes',
        features: [
            'Todo lo de Pro',
            'Documentos personalizados',
            'API dedicada',
            'Soporte 24/7',
            'Onboarding incluido'
        ],
        highlighted: false,
        buttonText: 'Suscribirse'
    },
];

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
    if (planId === 'free') {
        router.push('/chat');
        return;
    }

    // 🔥 Obtener el usuario actual para incluirlo en la referencia
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/login');
        return;
    }

    try {
        // 🔥 Obtener el ID del usuario desde el token JWT
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub; // o el campo que tenga el ID
        
        // 🔥 Crear referencia con el user_id y plan_id
        const reference = `sub_${userId}_${planId}_${Date.now()}`;
        
        // 🔥 Obtener el link de Wompi
        const link = WOMPI_LINKS[planId as keyof typeof WOMPI_LINKS];
        if (link) {
            // Abrir el link de Wompi con la referencia
            window.open(`${link}?reference=${reference}`, '_blank');
        } else {
            alert('❌ Link de pago no disponible');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar el pago');
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
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => {
                        const isCurrent = plan.id === currentPlan;
                        
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
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={isCurrent}
                                    className={`w-full mt-6 py-2 rounded-xl font-medium transition-all ${
                                        isCurrent
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                            : plan.highlighted
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : plan.id === 'free'
                                                    ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                                    : 'border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                    } disabled:opacity-50`}
                                >
                                    {isCurrent ? '✅ Plan actual' : plan.buttonText}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
                    <p>🔒 Pagos seguros con Wompi</p>
                    <p className="mt-1">Puedes cancelar tu suscripción en cualquier momento</p>
                </div>
            </div>
        </div>
    );
}