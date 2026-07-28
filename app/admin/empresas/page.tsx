'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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
  fecha_inicio: string;
}

interface Factura {
  id: number;
  numero_factura: string;
  cliente_id: number;
  mes: string;
  anio: string;
  valor_total: number;
  estado: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  fecha_pago: string | null;
}

interface UsuarioEmpresa {
  id: number;
  usuario: string;
  nombre: string;
  email: string;
  activo: boolean;
  fecha_registro: string;
  ultimo_acceso: string;
}

export default function AdminEmpresasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioEmpresa[]>([]);
  const [tab, setTab] = useState<'clientes' | 'facturas' | 'dashboard'>('clientes');
  const [showModal, setShowModal] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  
  // Formulario de cliente
  const [formCliente, setFormCliente] = useState({
    nombre_empresa: '',
    nit: '',
    email_contacto: '',
    telefono: '',
    usuarios_maximos: 5,
    valor_mensual: 599
  });

  // Formulario de usuario
  const [formUsuario, setFormUsuario] = useState({
    usuario: '',
    password: '',
    nombre: '',
    email: '',
    cliente_id: 0
  });

  // Formulario de factura
  const [formFactura, setFormFactura] = useState({
    cliente_id: 0,
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear()
  });

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

      const [clientesRes, facturasRes] = await Promise.all([
        axios.get(`${API_URL}/enterprise/clientes`, { headers }),
        axios.get(`${API_URL}/enterprise/facturas`, { headers })
      ]);

      setClientes(clientesRes.data);
      setFacturas(facturasRes.data);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.response?.data?.detail || 'Error al cargar los datos');
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

      await axios.post(
        `${API_URL}/enterprise/clientes`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      setShowModal(false);
      setFormCliente({
        nombre_empresa: '',
        nit: '',
        email_contacto: '',
        telefono: '',
        usuarios_maximos: 5,
        valor_mensual: 599
      });
      await cargarDatos();
      alert('✅ Cliente creado exitosamente');
    } catch (err: any) {
      console.error('Error creando cliente:', err);
      alert(err.response?.data?.detail || 'Error al crear el cliente');
    }
  };

  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      
      const formData = new URLSearchParams();
      Object.entries(formUsuario).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      await axios.post(
        `${API_URL}/enterprise/usuarios`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      setFormUsuario({
        usuario: '',
        password: '',
        nombre: '',
        email: '',
        cliente_id: 0
      });
      await cargarDatos();
      alert('✅ Usuario creado exitosamente');
      setShowModal(false);
    } catch (err: any) {
      console.error('Error creando usuario:', err);
      alert(err.response?.data?.detail || 'Error al crear el usuario');
    }
  };

  const generarFactura = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      
      const formData = new URLSearchParams();
      formData.append('cliente_id', String(formFactura.cliente_id));
      formData.append('mes', String(formFactura.mes));
      formData.append('anio', String(formFactura.anio));

      await axios.post(
        `${API_URL}/enterprise/facturas`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      setFormFactura({
        cliente_id: 0,
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear()
      });
      await cargarDatos();
      alert('✅ Factura generada exitosamente');
      setShowModal(false);
    } catch (err: any) {
      console.error('Error generando factura:', err);
      alert(err.response?.data?.detail || 'Error al generar la factura');
    }
  };

  const actualizarEstadoFactura = async (facturaId: number, estado: string) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      
      const formData = new URLSearchParams();
      formData.append('estado', estado);

      await axios.put(
        `${API_URL}/enterprise/facturas/${facturaId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      await cargarDatos();
      alert('✅ Estado de factura actualizado');
    } catch (err: any) {
      console.error('Error actualizando factura:', err);
      alert(err.response?.data?.detail || 'Error al actualizar la factura');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando datos empresariales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            🏢 Gestión Empresarial
          </h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            ← Volver al Panel
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setTab('clientes')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              tab === 'clientes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            👥 Clientes
          </button>
          <button
            onClick={() => setTab('facturas')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              tab === 'facturas'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            📄 Facturas
          </button>
          <button
            onClick={() => setTab('dashboard')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              tab === 'dashboard'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            📊 Dashboard
          </button>
        </div>

        {/* Contenido */}
        {tab === 'clientes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                👥 Clientes Empresariales
              </h2>
              <button
                onClick={() => {
                  setShowModal(true);
                  setClienteSeleccionado(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                ➕ Nuevo Cliente
              </button>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Empresa</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">NIT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contacto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usuarios</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{cliente.nombre_empresa}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cliente.nit}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cliente.email_contacto}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                        {cliente.usuarios_actuales}/{cliente.usuarios_maximos}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {cliente.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cliente.estado === 'activo' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {cliente.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                        ${cliente.valor_mensual.toLocaleString()} COP
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => {
                            setClienteSeleccionado(cliente);
                            setFormUsuario({ ...formUsuario, cliente_id: cliente.id });
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                        >
                          👤 Agregar usuario
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'facturas' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                📄 Facturas
              </h2>
              <button
                onClick={() => {
                  setShowModal(true);
                  setClienteSeleccionado(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                ➕ Nueva Factura
              </button>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">N° Factura</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mes/Año</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vencimiento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {facturas.map((factura) => {
                    const cliente = clientes.find(c => c.id === factura.cliente_id);
                    return (
                      <tr key={factura.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{factura.numero_factura}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cliente?.nombre_empresa || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{factura.mes}/{factura.anio}</td>
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                          ${factura.valor_total.toLocaleString()} COP
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            factura.estado === 'pagada' 
                              ? 'bg-green-100 text-green-700'
                              : factura.estado === 'vencida'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {factura.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(factura.fecha_vencimiento).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {factura.estado === 'pendiente' && (
                            <button
                              onClick={() => actualizarEstadoFactura(factura.id, 'pagada')}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-xs"
                            >
                              ✅ Pagar
                            </button>
                          )}
                          {factura.estado !== 'pagada' && (
                            <button
                              onClick={() => actualizarEstadoFactura(factura.id, 'vencida')}
                              className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs"
                            >
                              ❌ Vencida
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'dashboard' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              📊 Dashboard Empresarial
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Clientes</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{clientes.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Usuarios Activos</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {clientes.reduce((acc, c) => acc + c.usuarios_actuales, 0)}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Facturas Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {facturas.filter(f => f.estado === 'pendiente').length}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos Mensuales</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  ${facturas
                    .filter(f => f.estado === 'pagada')
                    .reduce((acc, f) => acc + f.valor_total, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {clienteSeleccionado ? '👤 Agregar Usuario' : '📝 Nuevo Registro'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {clienteSeleccionado ? (
              <form onSubmit={crearUsuario}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario *</label>
                    <input
                      type="text"
                      value={formUsuario.usuario}
                      onChange={(e) => setFormUsuario({ ...formUsuario, usuario: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña *</label>
                    <input
                      type="text"
                      value={formUsuario.password}
                      onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={formUsuario.nombre}
                      onChange={(e) => setFormUsuario({ ...formUsuario, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={formUsuario.email}
                      onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear Usuario
                  </button>
                </div>
              </form>
            ) : tab === 'clientes' ? (
              <form onSubmit={crearCliente}>
                <div className="space-y-3">
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
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear Cliente
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={generarFactura}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente *</label>
                    <select
                      value={formFactura.cliente_id}
                      onChange={(e) => setFormFactura({ ...formFactura, cliente_id: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Seleccionar cliente</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre_empresa}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mes</label>
                    <input
                      type="number"
                      value={formFactura.mes}
                      onChange={(e) => setFormFactura({ ...formFactura, mes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      min={1}
                      max={12}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Año</label>
                    <input
                      type="number"
                      value={formFactura.anio}
                      onChange={(e) => setFormFactura({ ...formFactura, anio: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generar Factura
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}