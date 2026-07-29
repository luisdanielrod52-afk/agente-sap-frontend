'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function AdminConsultasPage() {
  const router = useRouter();
  const [consultas, setConsultas] = useState([]);
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
    return <div className="p-8 text-center">Cargando consultas...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">💬 Consultas</h1>
        <Link href="/es/admin" className="text-blue-600 hover:underline">← Volver</Link>
      </div>
      <div className="space-y-4">
        {consultas.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No hay consultas</div>
        ) : (
          consultas.map((cons: any) => (
            <div key={cons.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200">
              <p className="font-medium">{cons.pregunta}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {cons.respuesta?.substring(0, 150)}...
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(cons.fecha).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}