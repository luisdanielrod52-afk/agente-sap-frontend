'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          📊 Panel de Administración
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Dashboard */}
          <Link
            href="/admin/dashboard"
            className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Dashboard</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Estadísticas y gráficas</p>
          </Link>

          {/* Usuarios */}
          <Link
            href="/admin/usuarios"
            className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Usuarios</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gestionar usuarios y roles</p>
          </Link>

          {/* Consultas */}
          <Link
            href="/admin/consultas"
            className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Consultas</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ver historial de consultas</p>
          </Link>

          {/* 🆕 Gestión Empresarial */}
          <Link
            href="/admin/empresas"
            className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🏢</div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Gestión Empresarial</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Clientes, usuarios y facturas</p>
          </Link>

          {/* Precios */}
          <Link
            href="/pricing"
            className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Planes y Precios</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gestionar suscripciones</p>
          </Link>

          {/* Configuración */}
          <Link
            href="/admin/configuracion"
            className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Configuración</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ajustes del sistema</p>
          </Link>
        </div>
      </div>
    </div>
  );
}