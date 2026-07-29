'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_usuarios: 0,
    usuarios_activos: 0,
    consultas_totales: 0,
    consultas_hoy: 0,
    consultas_semana: 0,
    promedio_respuesta: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/es/login');
      return;
    }
    cargarEstadisticas();
  }, [router]);

  const cargarEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      const response = await axios.get(`${API_URL}/admin/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err: any) {
      console.error('Error cargando estadísticas:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        router.push('/es/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/es/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            📊 Panel de Administración
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            🚪 Cerrar Sesión
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Usuarios</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total_usuarios}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Usuarios Activos</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.usuarios_activos}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Consultas Totales</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.consultas_totales}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Consultas Hoy</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.consultas_hoy}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Última Semana</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.consultas_semana}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Promedio Respuesta</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.promedio_respuesta}s</p>
          </div>
        </div>

        {/* Tarjetas de navegación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/es/admin/empresas"
            className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">🏢</div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Gestión Empresarial</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Clientes, usuarios y facturas</p>
          </Link>
          <Link
            href="/es/admin/dashboard"
            className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Dashboard Analítico</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Estadísticas y gráficas</p>
          </Link>
        </div>

        <button
          onClick={cargarEstadisticas}
          className="mt-6 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Actualizar datos
        </button>
      </div>
    </div>
  );
}