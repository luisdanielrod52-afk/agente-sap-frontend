'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resumen, setResumen] = useState<any>(null);
  const [consultasPorDia, setConsultasPorDia] = useState<any>(null);
  const [tiempoRespuesta, setTiempoRespuesta] = useState<any>(null);
  const [usuariosActivos, setUsuariosActivos] = useState<any>(null);
  const [conversion, setConversion] = useState<any>(null);
  const [topPreguntas, setTopPreguntas] = useState<any[]>([]);
  const [consultasPorPlan, setConsultasPorPlan] = useState<any[]>([]);
  const [dias, setDias] = useState(30);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/es/login');
      return;
    }
    cargarDatos();
  }, [dias]);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      const headers = { Authorization: `Bearer ${token}` };

      const [resumenRes, consultasRes, tiempoRes, activosRes, conversionRes, topRes, planRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/resumen`, { headers }),
        axios.get(`${API_URL}/analytics/consultas-por-dia?dias=${dias}`, { headers }),
        axios.get(`${API_URL}/analytics/tiempo-respuesta?dias=${dias}`, { headers }),
        axios.get(`${API_URL}/analytics/usuarios-activos`, { headers }),
        axios.get(`${API_URL}/analytics/conversion`, { headers }),
        axios.get(`${API_URL}/analytics/top-preguntas?limit=10`, { headers }),
        axios.get(`${API_URL}/analytics/consultas-por-plan`, { headers })
      ]);

      setResumen(resumenRes.data);
      setConsultasPorDia(consultasRes.data);
      setTiempoRespuesta(tiempoRes.data);
      setUsuariosActivos(activosRes.data);
      setConversion(conversionRes.data);
      setTopPreguntas(topRes.data);
      setConsultasPorPlan(planRes.data);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/es/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Configuración de gráficas
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            📊 Métricas y Analíticas
          </h1>
          <Link href="/es/admin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
            ← Volver al Panel
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Selector de días */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setDias(7)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dias === 7
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Últimos 7 días
          </button>
          <button
            onClick={() => setDias(30)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dias === 30
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Últimos 30 días
          </button>
          <button
            onClick={() => setDias(90)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dias === 90
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Últimos 90 días
          </button>
          <button
            onClick={cargarDatos}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors ml-auto"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Consultas Hoy</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{resumen?.consultas_hoy || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Consultas este Mes</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{resumen?.consultas_mes || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Usuarios Nuevos (Mes)</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{resumen?.usuarios_mes || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Promedio Respuesta</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{resumen?.promedio_respuesta || 0}s</p>
          </div>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consultas por día */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              📈 Consultas por día
            </h3>
            <div className="h-64">
              {consultasPorDia && (
                <Bar
                  data={{
                    labels: consultasPorDia.labels || [],
                    datasets: [{
                      label: 'Consultas',
                      data: consultasPorDia.values || [],
                      backgroundColor: 'rgba(59, 130, 246, 0.6)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 2,
                      borderRadius: 4,
                    }]
                  }}
                  options={chartOptions}
                />
              )}
            </div>
          </div>

          {/* Tiempo de respuesta */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              ⏱️ Tiempo de respuesta (segundos)
            </h3>
            <div className="h-64">
              {tiempoRespuesta && (
                <Line
                  data={{
                    labels: tiempoRespuesta.labels || [],
                    datasets: [{
                      label: 'Tiempo promedio',
                      data: tiempoRespuesta.values || [],
                      borderColor: 'rgba(59, 130, 246, 1)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 2,
                    }]
                  }}
                  options={chartOptions}
                />
              )}
            </div>
          </div>

          {/* Usuarios activos */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              👥 Usuarios activos (7 días)
            </h3>
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                  {usuariosActivos?.activos || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  de {usuariosActivos?.total || 0} usuarios totales
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {usuariosActivos?.porcentaje || 0}% de actividad
                </p>
              </div>
            </div>
          </div>

          {/* Tasa de conversión */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              💰 Tasa de conversión
            </h3>
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <p className="text-5xl font-bold text-green-600 dark:text-green-400">
                  {conversion?.tasa_conversion || 0}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {conversion?.pagados || 0} usuarios pagados
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  de {conversion?.total || 0} usuarios totales
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Segunda fila */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Top preguntas */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              🔥 Top preguntas
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {topPreguntas.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay preguntas registradas</p>
              ) : (
                topPreguntas.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                      {index + 1}. {item.pregunta}
                    </span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 ml-2">
                      {item.total}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Consultas por plan */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              📊 Consultas por plan
            </h3>
            <div className="h-48">
              {consultasPorPlan && (
                <Pie
                  data={{
                    labels: consultasPorPlan.map((p: any) => p.plan || 'desconocido'),
                    datasets: [{
                      data: consultasPorPlan.map((p: any) => p.total),
                      backgroundColor: ['#9CA3AF', '#3B82F6', '#8B5CF6', '#F59E0B'],
                      borderWidth: 2,
                      borderColor: '#fff',
                    }]
                  }}
                  options={chartOptions}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}