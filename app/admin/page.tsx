'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  empresa: string;
  plan: string;
  activo: boolean;
  es_admin: boolean;
  fecha_registro: string;
  total_consultas: number;
}

interface Consulta {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  pregunta: string;
  respuesta: string;
  fecha: string;
  estado: string;
}

interface Estadisticas {
  total_usuarios: number;
  usuarios_activos: number;
  consultas_totales: number;
  consultas_hoy: number;
  consultas_semana: number;
  promedio_respuesta: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [tab, setTab] = useState<'dashboard' | 'usuarios' | 'consultas'>('dashboard');
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null);

  // ====== FILTROS PARA USUARIOS ======
  const [filtroUsuarios, setFiltroUsuarios] = useState({
    busqueda: '',
    plan: 'todos',
    estado: 'todos'
  });

  // ====== FILTROS PARA CONSULTAS ======
  const [filtroConsultas, setFiltroConsultas] = useState({
    busqueda: '',
    estado: 'todos',
    fecha: 'todas'
  });

  // ====== USUARIOS FILTRADOS ======
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(user => {
      // Filtro por búsqueda (nombre, usuario, email)
      const busqueda = filtroUsuarios.busqueda.toLowerCase();
      const coincideBusqueda = 
        user.usuario.toLowerCase().includes(busqueda) ||
        (user.nombre?.toLowerCase() || '').includes(busqueda) ||
        (user.apellido?.toLowerCase() || '').includes(busqueda) ||
        (user.email?.toLowerCase() || '').includes(busqueda);
      
      // Filtro por plan
      const coincidePlan = filtroUsuarios.plan === 'todos' || user.plan === filtroUsuarios.plan;
      
      // Filtro por estado
      const coincideEstado = filtroUsuarios.estado === 'todos' || 
        (filtroUsuarios.estado === 'activo' ? user.activo : !user.activo);
      
      return coincideBusqueda && coincidePlan && coincideEstado;
    });
  }, [usuarios, filtroUsuarios]);

  // ====== CONSULTAS FILTRADAS ======
  const consultasFiltradas = useMemo(() => {
    return consultas.filter(cons => {
      // Filtro por búsqueda (pregunta o respuesta)
      const busqueda = filtroConsultas.busqueda.toLowerCase();
      const coincideBusqueda = 
        cons.pregunta.toLowerCase().includes(busqueda) ||
        (cons.respuesta?.toLowerCase() || '').includes(busqueda);
      
      // Filtro por estado
      const coincideEstado = filtroConsultas.estado === 'todos' || cons.estado === filtroConsultas.estado;
      
      // Filtro por fecha
      let coincideFecha = true;
      if (filtroConsultas.fecha !== 'todas') {
        const fechaCons = new Date(cons.fecha);
        const hoy = new Date();
        if (filtroConsultas.fecha === 'hoy') {
          coincideFecha = fechaCons.toDateString() === hoy.toDateString();
        } else if (filtroConsultas.fecha === 'semana') {
          const semanaAtras = new Date();
          semanaAtras.setDate(semanaAtras.getDate() - 7);
          coincideFecha = fechaCons >= semanaAtras;
        } else if (filtroConsultas.fecha === 'mes') {
          const mesAtras = new Date();
          mesAtras.setMonth(mesAtras.getMonth() - 1);
          coincideFecha = fechaCons >= mesAtras;
        }
      }
      
      return coincideBusqueda && coincideEstado && coincideFecha;
    });
  }, [consultas, filtroConsultas]);

  // ====== CARGAR DATOS ======
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes, consRes] = await Promise.all([
        axios.get(`${API_URL}/admin/estadisticas`, { headers }),
        axios.get(`${API_URL}/admin/usuarios`, { headers }),
        axios.get(`${API_URL}/admin/consultas?limit=200`, { headers })
      ]);

      setEstadisticas(statsRes.data);
      setUsuarios(usersRes.data);
      setConsultas(consRes.data);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.response?.data?.detail || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // ====== ACTUALIZAR USUARIO ======
  const actualizarUsuario = async (usuarioId: number, data: Partial<Usuario>) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      await axios.put(`${API_URL}/admin/usuarios/${usuarioId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await cargarDatos();
      setEditandoUsuario(null);
    } catch (err: any) {
      console.error('Error actualizando usuario:', err);
      alert('Error al actualizar el usuario');
    }
  };

  // ====== ELIMINAR CONSULTA ======
  const eliminarConsulta = async (consultaId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta consulta?')) return;
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      await axios.delete(`${API_URL}/admin/consultas/${consultaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await cargarDatos();
    } catch (err: any) {
      console.error('Error eliminando consulta:', err);
      alert('Error al eliminar la consulta');
    }
  };

  // ====== RENDER ======
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <p className="text-red-600 dark:text-red-300 font-medium">❌ Error</p>
          <p className="text-sm text-red-500 dark:text-red-400 mt-2">{error}</p>
          <button
            onClick={cargarDatos}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              📊 Panel de Administración
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">v2.0</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('username');
              router.push('/login');
            }}
            className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex gap-4 overflow-x-auto">
          <button
            onClick={() => setTab('dashboard')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              tab === 'dashboard'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setTab('usuarios')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              tab === 'usuarios'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            👥 Usuarios ({usuariosFiltrados.length})
          </button>
          <button
            onClick={() => setTab('consultas')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              tab === 'consultas'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            💬 Consultas ({consultasFiltradas.length})
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {tab === 'dashboard' && (
          <div>
            {/* Cards de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Usuarios</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                  {estadisticas?.total_usuarios || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Usuarios Activos</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {estadisticas?.usuarios_activos || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Consultas Totales</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {estadisticas?.consultas_totales || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Consultas Hoy</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {estadisticas?.consultas_hoy || 0}
                </p>
              </div>
            </div>

            {/* Más estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Última Semana</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {estadisticas?.consultas_semana || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Promedio Respuesta</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {estadisticas?.promedio_respuesta || 0}s
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Planes</p>
                <p className="text-sm text-gray-800 dark:text-white mt-1">
                  🆓 {usuarios.filter(u => u.plan === 'gratis').length} | 
                  ⭐ {usuarios.filter(u => u.plan === 'pro').length} | 
                  🏢 {usuarios.filter(u => u.plan === 'empresa').length}
                </p>
              </div>
            </div>

            <button
              onClick={cargarDatos}
              className="mt-6 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Actualizar datos
            </button>
          </div>
        )}

        {tab === 'usuarios' && (
          <div>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                👥 Lista de Usuarios
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {usuariosFiltrados.length} de {usuarios.length} usuarios
              </span>
            </div>

            {/* FILTROS DE USUARIOS */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Buscar</label>
                  <input
                    type="text"
                    placeholder="Nombre, usuario o email..."
                    value={filtroUsuarios.busqueda}
                    onChange={(e) => setFiltroUsuarios({ ...filtroUsuarios, busqueda: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Plan</label>
                  <select
                    value={filtroUsuarios.plan}
                    onChange={(e) => setFiltroUsuarios({ ...filtroUsuarios, plan: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="todos">Todos los planes</option>
                    <option value="gratis">🆓 Gratis</option>
                    <option value="pro">⭐ Pro</option>
                    <option value="empresa">🏢 Empresa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Estado</label>
                  <select
                    value={filtroUsuarios.estado}
                    onChange={(e) => setFiltroUsuarios({ ...filtroUsuarios, estado: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="todos">Todos</option>
                    <option value="activo">✅ Activo</option>
                    <option value="inactivo">❌ Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TABLA DE USUARIOS */}
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Consultas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No hay usuarios que coincidan con los filtros
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 font-medium">{user.usuario}</td>
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                          {user.nombre} {user.apellido}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.plan === 'gratis' ? 'bg-gray-100 text-gray-600' :
                            user.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {user.plan === 'gratis' ? '🆓' : user.plan === 'pro' ? '⭐' : '🏢'} {user.plan}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.activo ? '✅ Activo' : '❌ Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.total_consultas || 0}</td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => setEditandoUsuario(user)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            ✏️ Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'consultas' && (
          <div>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                💬 Últimas Consultas
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {consultasFiltradas.length} de {consultas.length} consultas
              </span>
            </div>

            {/* FILTROS DE CONSULTAS */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Buscar</label>
                  <input
                    type="text"
                    placeholder="Pregunta o respuesta..."
                    value={filtroConsultas.busqueda}
                    onChange={(e) => setFiltroConsultas({ ...filtroConsultas, busqueda: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Estado</label>
                  <select
                    value={filtroConsultas.estado}
                    onChange={(e) => setFiltroConsultas({ ...filtroConsultas, estado: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="todos">Todos</option>
                    <option value="resuelta">✅ Resuelta</option>
                    <option value="pendiente">⏳ Pendiente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha</label>
                  <select
                    value={filtroConsultas.fecha}
                    onChange={(e) => setFiltroConsultas({ ...filtroConsultas, fecha: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="todas">Todas</option>
                    <option value="hoy">📅 Hoy</option>
                    <option value="semana">📅 Última semana</option>
                    <option value="mes">📅 Último mes</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setFiltroConsultas({ busqueda: '', estado: 'todos', fecha: 'todas' })}
                    className="w-full px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    🔄 Limpiar filtros
                  </button>
                </div>
              </div>
            </div>

            {/* LISTA DE CONSULTAS */}
            <div className="space-y-4">
              {consultasFiltradas.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No hay consultas que coincidan con los filtros</p>
                </div>
              ) : (
                consultasFiltradas.map((cons) => (
                  <div key={cons.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {cons.pregunta}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {cons.respuesta?.substring(0, 200)}...
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>👤 {cons.usuario_nombre || 'Desconocido'}</span>
                          <span>📅 {new Date(cons.fecha).toLocaleDateString('es')}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            cons.estado === 'resuelta' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {cons.estado === 'resuelta' ? '✅ Resuelta' : '⏳ Pendiente'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarConsulta(cons.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-4 flex-shrink-0"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de edición de usuario */}
      {editandoUsuario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              ✏️ Editar Usuario: {editandoUsuario.usuario}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
                <select
                  value={editandoUsuario.plan}
                  onChange={(e) => setEditandoUsuario({ ...editandoUsuario, plan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="gratis">🆓 Gratis</option>
                  <option value="pro">⭐ Pro</option>
                  <option value="empresa">🏢 Empresa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                <select
                  value={editandoUsuario.activo ? 'activo' : 'inactivo'}
                  onChange={(e) => setEditandoUsuario({ ...editandoUsuario, activo: e.target.value === 'activo' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="activo">✅ Activo</option>
                  <option value="inactivo">❌ Inactivo</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => actualizarUsuario(editandoUsuario.id, { plan: editandoUsuario.plan, activo: editandoUsuario.activo })}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  💾 Guardar
                </button>
                <button
                  onClick={() => setEditandoUsuario(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}