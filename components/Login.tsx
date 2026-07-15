'use client';
import { useState } from 'react';
import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Registro
          const response = await axios.post('/api/registro',
          null,
          {
            params: { usuario: username, password: password }
          }
        );
        
        alert('✅ Usuario registrado exitosamente');
        setIsRegistering(false);
        setLoading(false);
        return;
      }

      // Login
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(`${API_URL}/registro`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      onLogin(response.data.access_token);
    } catch (err: any) {
      console.error('Error completo:', err);
      
      let mensajeError = 'Error en la autenticación';
      if (err.response) {
        mensajeError = err.response.data?.detail || err.response.data?.mensaje || mensajeError;
      } else if (err.request) {
        mensajeError = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:8000';
      }
      
      setError(mensajeError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-6">
          🤖 Agente SAP HCM
        </h1>
        <h2 className="text-xl text-center mb-6">
          {isRegistering ? 'Registro' : 'Iniciar Sesión'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '⏳ Procesando...' : (isRegistering ? 'Registrarse' : 'Ingresar')}
          </button>
        </form>
        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
          }}
          className="mt-4 text-sm text-blue-600 hover:underline w-full text-center"
        >
          {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );
}