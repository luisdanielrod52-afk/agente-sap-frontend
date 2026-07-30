'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function AdminConsultasPage() {
  const router = useRouter();
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/es/login');
      return;
    }
    cargarConsultas();
  }, [router]);

  const cargarConsultas = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      const response = await axios.get(`${API_URL}/admin/consultas?limit=200`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConsultas(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando consultas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">💬 Consultas</h1>
          <Link href="/es/admin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
            ← Volver al Panel
          </Link>
        </div>

        <div className="space-y-4">
          {consultas.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center text-gray-500">
              No hay consultas registradas
            </div>
          ) : (
            consultas.map((cons) => (
              <div key={cons.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="font-medium text-gray-800 dark:text-white">{cons.pregunta}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {cons.respuesta?.substring(0, 150)}...
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {new Date(cons.fecha).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}