'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    nombre: '',
    apellido: '',
    email: '',
    empresa: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      
      const formDataEncoded = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataEncoded.append(key, value);
      });

      const response = await axios.post(`${API_URL}/registro`, formDataEncoded, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      setExito(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Crear cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Comienza tu prueba gratuita
          </p>
        </div>

        {exito ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <p className="text-green-700 dark:text-green-300 font-medium">
              ✅ ¡Registro exitoso!
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Redirigiendo al login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Usuario *
              </label>
              <input
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="ej: juan.perez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Empresa
              </label>
              <input
                type="text"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Nombre de tu empresa (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="+56 9 1234 5678 (opcional)"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {cargando ? 'Registrando...' : 'Crear cuenta'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ¿Ya tienes cuenta?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Iniciar sesión
                </a>
              </p>
            </div>

            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              Al registrarte, aceptas nuestros Términos y Condiciones
            </div>
          </form>
        )}
      </div>
    </div>
  );
}