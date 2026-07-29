'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface Cliente {
  id: number;
  nombre_empresa: string;
  nit: string;
  email_contacto: string;
  telefono: string;
  usuarios_actuales: number;
  usuarios_maximos: number;
  plan: string;
  estado: string;
  valor_mensual: number;
  fecha_renovacion: string;
}

export default function AdminEmpresasPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formCliente, setFormCliente] = useState({
    nombre_empresa: '',
    nit: '',
    email_contacto: '',
    telefono: '',
    usuarios_maximos: 5,
    valor_mensual: 599
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      const response = await axios.get(`${API_URL}/enterprise/clientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(response.data);
    } catch (err) {
      console.error('Error cargando clientes:', err);
      setError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const crearCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      const formData = new URLSearchParams();
      Object.entries(formCliente).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      await axios.post(`${API_URL}/enterprise/clientes`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      setShowModal(false);
      setFormCliente({
        nombre_empresa: '',
        nit: '',
        email_contacto: '',
        telefono: '',
        usuarios_maximos: 5,
        valor_mensual: 599
      });
      await cargarClientes();
      alert('✅ Cliente creado exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al crear cliente');
    }
  };

  if (loading) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🏢 Gestión Empresarial</h1>
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
            ← Volver al Panel
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Clientes</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            ➕ Nuevo Cliente
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuarios</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay clientes registrados
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{cliente.nombre_empresa}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cliente.nit}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cliente.email_contacto}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      {cliente.usuarios_actuales}/{cliente.usuarios_maximos}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cliente.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {cliente.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      ${cliente.valor_mensual.toLocaleString()} COP
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">📝 Nuevo Cliente</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={crearCliente} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empresa *</label>
                <input
                  type="text"
                  value={formCliente.nombre_empresa}
                  onChange={(e) => setFormCliente({ ...formCliente, nombre_empresa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIT *</label>
                <input
                  type="text"
                  value={formCliente.nit}
                  onChange={(e) => setFormCliente({ ...formCliente, nit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Contacto *</label>
                <input
                  type="email"
                  value={formCliente.email_contacto}
                  onChange={(e) => setFormCliente({ ...formCliente, email_contacto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={formCliente.telefono}
                  onChange={(e) => setFormCliente({ ...formCliente, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuarios Máximos</label>
                <input
                  type="number"
                  value={formCliente.usuarios_maximos}
                  onChange={(e) => setFormCliente({ ...formCliente, usuarios_maximos: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Mensual (COP)</label>
                <input
                  type="number"
                  value={formCliente.valor_mensual}
                  onChange={(e) => setFormCliente({ ...formCliente, valor_mensual: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Crear Cliente
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}