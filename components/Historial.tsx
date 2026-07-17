'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Conversacion {
  id: number;
  pregunta: string;
  respuesta: string;
  fecha: string;
}

export default function Historial({ token, onSelectConversacion }: { token: string; onSelectConversacion: (pregunta: string) => void }) {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (abierto) {
      cargarHistorial();
    }
  }, [abierto]);

  const cargarHistorial = async () => {
    setCargando(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_URL}/historial`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversaciones(response.data);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError('No se pudo cargar el historial');
    } finally {
      setCargando(false);
    }
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative">
      {/* Botón para abrir/cerrar historial */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
        aria-label="Historial de conversaciones"
      >
        <span className="text-xl">📋</span>
        {conversaciones.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {conversaciones.length}
          </span>
        )}
      </button>

      {/* Panel de historial */}
      {abierto && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 dark:text-white">📋 Historial</h3>
            <button
              onClick={() => setAbierto(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto max-h-72">
            {cargando ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                ⏳ Cargando...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                {error}
              </div>
            ) : conversaciones.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                📭 No hay conversaciones previas
              </div>
            ) : (
              conversaciones.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConversacion(conv.pregunta);
                    setAbierto(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {conv.pregunta}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatFecha(conv.fecha)}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
            <span className="text-xs text-gray-400">
              {conversaciones.length} conversaciones guardadas
            </span>
          </div>
        </div>
      )}
    </div>
  );
}