'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface UserMenuProps {
  username: string;
  onLogout: () => void;
}

interface UserData {
  id: number;
  usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  empresa: string;
  plan: string;
}

export default function UserMenu({ username, onLogout }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
        const response = await axios.get(`${API_URL}/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error obteniendo datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Función para obtener el nombre completo o mostrar el usuario
  const getDisplayName = () => {
    if (userData?.nombre && userData?.apellido) {
      return `${userData.nombre} ${userData.apellido}`;
    }
    if (userData?.nombre) {
      return userData.nombre;
    }
    return username || 'Usuario';
  };

  const getPlanBadge = () => {
    const plan = userData?.plan || 'gratis';
    const colors = {
      gratis: 'bg-gray-100 text-gray-600 border-gray-300',
      pro: 'bg-blue-100 text-blue-700 border-blue-300',
      empresa: 'bg-purple-100 text-purple-700 border-purple-300'
    };
    return colors[plan as keyof typeof colors] || colors.gratis;
  };

  const getPlanLabel = () => {
    const plan = userData?.plan || 'gratis';
    const labels = {
      gratis: 'Gratis',
      pro: 'Pro',
      empresa: 'Empresa'
    };
    return labels[plan as keyof typeof labels] || 'Gratis';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {getDisplayName().charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
          {getDisplayName()}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="font-semibold text-gray-800 dark:text-white">
              {getDisplayName()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{userData?.usuario || username}
            </p>
            {userData?.email && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {userData.email}
              </p>
            )}
            {userData?.empresa && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                🏢 {userData.empresa}
              </p>
            )}
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded-full border ${getPlanBadge()}`}>
                Plan: {getPlanLabel()}
              </span>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/admin');
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-lg">📊</span> Panel de Administración
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/chat');
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-lg">💬</span> Ir al Chat
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-lg">🚪</span> Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}