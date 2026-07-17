'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [pestana, setPestana] = useState('dashboard');
  
  // Estados de datos
  const [estadisticas, setEstadisticas] = useState({
    total_usuarios: 0,
    total_consultas: 0,
    consultas_hoy: 0,
    usuarios_activos: 0,
    consultas_ultima_semana: 0,
    promedio_respuesta: 0
  });
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [filtroUsuario, setFiltroUsuario] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      cargarDatos(savedToken);
    } else {
      router.push('/');
    }
  }, []);

  const cargarDatos = async (token: string) => {
    setCargando(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const [statsRes, usersRes, queriesRes] = await Promise.all([
        axios.get(`${API_URL}/admin/estadisticas`, { headers }),
        axios.get(`${API_URL}/admin/usuarios`, { headers }),
        axios.get(`${API_URL}/admin/consultas?limit=100`, { headers })
      ]);
      
      setEstadisticas(statsRes.data);
      setUsuarios(usersRes.data);
      setConsultas(queriesRes.data);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      if (err.response?.status === 403) {
        setError('No tienes permisos de administrador');
        setTimeout(() => router.push('/'), 2000);
      } else {
        setError('Error al cargar los datos');
      }
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/');
  };

  const toggleUsuario = async (usuarioId: number, activo: boolean) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await axios.put(
        `${API_URL}/admin/usuarios/${usuarioId}?activo=${!activo}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Recargar datos
      cargarDatos(token);
    } catch (err) {
      alert('Error al actualizar usuario');
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl">⏳ Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">📊 Panel de Administración</h1>
            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              v2.0
            </span>
          </div>
          <button
            onClick={cerrarSesion}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setPestana('dashboard')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              pestana === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setPestana('usuarios')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              pestana === 'usuarios' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            👥 Usuarios ({estadisticas.total_usuarios})
          </button>
          <button
            onClick={() => setPestana('consultas')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              pestana === 'consultas' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            📝 Consultas ({estadisticas.total_consultas})
          </button>
        </div>

        {/* Dashboard */}
        {pestana === 'dashboard' && (
          <div>
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Total Usuarios</h3>
                <p className="text-3xl font-bold text-blue-600">{estadisticas.total_usuarios}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Usuarios Activos</h3>
                <p className="text-3xl font-bold text-green-600">{estadisticas.usuarios_activos}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Consultas Totales</h3>
                <p className="text-3xl font-bold text-purple-600">{estadisticas.total_consultas}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Consultas Hoy</h3>
                <p className="text-3xl font-bold text-orange-600">{estadisticas.consultas_hoy}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Última Semana</h3>
                <p className="text-3xl font-bold text-indigo-600">{estadisticas.consultas_ultima_semana || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Promedio Respuesta</h3>
                <p className="text-3xl font-bold text-teal-600">{estadisticas.promedio_respuesta || 0}s</p>
              </div>
            </div>

            {/* Actividad reciente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-gray-700 mb-4">📋 Últimas consultas</h3>
                {consultas.slice(0, 5).map((c) => (
                  <div key={c.id} className="border-b border-gray-100 py-2 last:border-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.pregunta}</p>
                    <p className="text-xs text-gray-400">Por usuario #{c.usuario} • {formatFecha(c.fecha)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-gray-700 mb-4">👥 Últimos usuarios</h3>
                {usuarios.slice(0, 5).map((u) => (
                  <div key={u.id} className="border-b border-gray-100 py-2 last:border-0 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.usuario}</p>
                      <p className="text-xs text-gray-400">Registrado: {formatFecha(u.fecha_registro)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Usuarios */}
        {pestana === 'usuarios' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <span className="text-sm text-gray-500">
                  {usuarios.filter(u => u.usuario.toLowerCase().includes(filtroUsuario.toLowerCase())).length} usuarios
                </span>
              </div>
              <button
                onClick={() => cargarDatos(token)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                🔄 Actualizar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consultas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usuarios
                    .filter(u => u.usuario.toLowerCase().includes(filtroUsuario.toLowerCase()))
                    .map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 font-medium text-gray-800">{user.usuario}</td>
                        <td className="px-6 py-4 text-gray-600">{user.nombre || '-'} {user.apellido || ''}</td>
                        <td className="px-6 py-4 text-gray-600">{user.email || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatFecha(user.fecha_registro)}</td>
                        <td className="px-6 py-4 text-center">{user.total_consultas || 0}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.plan === 'pro' ? 'bg-green-100 text-green-800' :
                            user.plan === 'empresa' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.plan || 'gratis'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleUsuario(user.id, user.activo)}
                            className={`text-xs px-3 py-1 rounded transition-colors ${
                              user.activo 
                                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                          >
                            {user.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Consultas */}
        {pestana === 'consultas' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {consultas.length} consultas mostradas
              </span>
              <button
                onClick={() => cargarDatos(token)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                🔄 Actualizar
              </button>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pregunta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuentes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {consultas.map((consulta) => (
                    <tr key={consulta.id}>
                      <td className="px-6 py-4 text-sm text-gray-600">#{consulta.usuario}</td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-800 truncate" title={consulta.pregunta}>
                          {consulta.pregunta}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatFecha(consulta.fecha)}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">
                          {consulta.fuentes?.length || 0} fuentes
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}