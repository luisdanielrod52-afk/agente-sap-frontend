'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pestaña, setPestaña] = useState('dashboard');

  useEffect(() => {
    // Obtener token del localStorage
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      setToken(storedToken);
      cargarDatos(storedToken);
    }
  }, []);

  const cargarDatos = async (token: string) => {
    setCargando(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [stats, users, queries] = await Promise.all([
        axios.get('http://localhost:8000/admin/estadisticas', { headers }),
        axios.get('http://localhost:8000/admin/usuarios', { headers }),
        axios.get('http://localhost:8000/admin/consultas?limit=20', { headers })
      ]);
      
      setEstadisticas(stats.data);
      setUsuarios(users.data);
      setConsultas(queries.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        alert('No tienes permisos de administrador');
        localStorage.removeItem('admin_token');
        setToken('');
      }
    } finally {
      setCargando(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post('http://localhost:8000/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const token = response.data.access_token;
      localStorage.setItem('admin_token', token);
      setToken(token);
      cargarDatos(token);
    } catch (error) {
      alert('Credenciales incorrectas');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h1 className="text-2xl font-bold text-center mb-6">🔐 Panel de Administración</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Usuario"
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">⏳ Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📊 Panel de Administración</h1>
          <button
            onClick={() => {
              localStorage.removeItem('admin_token');
              setToken('');
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setPestaña('dashboard')}
            className={`px-4 py-2 rounded-lg ${pestaña === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setPestaña('usuarios')}
            className={`px-4 py-2 rounded-lg ${pestaña === 'usuarios' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            👥 Usuarios
          </button>
          <button
            onClick={() => setPestaña('consultas')}
            className={`px-4 py-2 rounded-lg ${pestaña === 'consultas' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            📝 Consultas
          </button>
        </div>

        {/* Dashboard */}
        {pestaña === 'dashboard' && estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500">Total Usuarios</h3>
              <p className="text-3xl font-bold">{estadisticas.total_usuarios}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500">Consultas Hoy</h3>
              <p className="text-3xl font-bold">{estadisticas.consultas_hoy}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500">Documentos Indexados</h3>
              <p className="text-3xl font-bold">{estadisticas.documentos_indexados}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500">Total Consultas</h3>
              <p className="text-3xl font-bold">{estadisticas.total_consultas}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500">Usuarios Activos</h3>
              <p className="text-3xl font-bold">{estadisticas.usuarios_activos}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500">Promedio Respuesta</h3>
              <p className="text-3xl font-bold">{estadisticas.promedio_respuesta}s</p>
            </div>
          </div>
        )}

        {/* Usuarios */}
        {pestaña === 'usuarios' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consultas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuarios.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">{user.usuario}</td>
                    <td className="px-6 py-4">{user.total_consultas}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.plan === 'pro' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.es_admin ? '✅' : '❌'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Consultas */}
        {pestaña === 'consultas' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pregunta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {consultas.map((query) => (
                  <tr key={query.id}>
                    <td className="px-6 py-4">{query.usuario_nombre}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{query.pregunta}</td>
                    <td className="px-6 py-4">{new Date(query.fecha).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{query.tiempo_respuesta}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}