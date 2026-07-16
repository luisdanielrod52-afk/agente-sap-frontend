'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({ total_usuarios: 0, total_consultas: 0, consultas_hoy: 0 });
  const [cargando, setCargando] = useState(true);
  const [pestana, setPestana] = useState('dashboard');
  const [error, setError] = useState('');

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
        axios.get(`${API_URL}/admin/consultas?limit=50`, { headers })
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
    router.push('/');
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
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">📊 Panel de Administración</h1>
          <button
            onClick={cerrarSesion}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setPestana('dashboard')}
            className={`px-4 py-2 rounded-lg ${pestana === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setPestana('usuarios')}
            className={`px-4 py-2 rounded-lg ${pestana === 'usuarios' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            👥 Usuarios ({estadisticas.total_usuarios})
          </button>
          <button
            onClick={() => setPestana('consultas')}
            className={`px-4 py-2 rounded-lg ${pestana === 'consultas' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            📝 Consultas ({estadisticas.total_consultas})
          </button>
        </div>

        {/* Dashboard */}
        {pestana === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500">Total Usuarios</h3>
              <p className="text-3xl font-bold">{estadisticas.total_usuarios}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500">Consultas Totales</h3>
              <p className="text-3xl font-bold">{estadisticas.total_consultas}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500">Consultas Hoy</h3>
              <p className="text-3xl font-bold">{estadisticas.consultas_hoy}</p>
            </div>
          </div>
        )}

        {/* Usuarios */}
        {pestana === 'usuarios' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuarios.map((user: any) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">{user.usuario}</td>
                    <td className="px-6 py-4">{user.nombre || '-'} {user.apellido || ''}</td>
                    <td className="px-6 py-4">{user.email || '-'}</td>
                    <td className="px-6 py-4">{new Date(user.fecha_registro).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.plan === 'pro' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.plan || 'gratis'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Consultas */}
        {pestana === 'consultas' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pregunta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {consultas.map((consulta: any) => (
                  <tr key={consulta.id}>
                    <td className="px-6 py-4">#{consulta.usuario}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{consulta.pregunta}</td>
                    <td className="px-6 py-4">{new Date(consulta.fecha).toLocaleString()}</td>
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