'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Conversacion {
  id: number;
  pregunta: string;
  respuesta: string;
  fecha: string;
  fuentes?: any[];
}

interface Paginacion {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function Historial({ token, onSelectConversacion }: { token: string; onSelectConversacion: (pregunta: string) => void }) {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [paginacion, setPaginacion] = useState<Paginacion>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    if (abierto) {
      cargarHistorial(1);
    }
  }, [abierto]);

  const cargarHistorial = async (page: number = 1) => {
    setCargando(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_URL}/historial?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversaciones(response.data.data);
      setPaginacion(response.data.pagination);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError('No se pudo cargar el historial');
    } finally {
      setCargando(false);
    }
  };

  const eliminarConversacion = async (id: number) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await axios.delete(`${API_URL}/historial/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Recargar la página actual
      cargarHistorial(paginacion.page);
    } catch (err) {
      console.error('Error eliminando conversación:', err);
      alert('No se pudo eliminar la conversación');
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
        {paginacion.total > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {paginacion.total > 99 ? '99+' : paginacion.total}
          </span>
        )}
      </button>

      {/* Panel de historial */}
      {abierto && (
        <div className="absolute right-0 mt-2 w-96 max-h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 dark:text-white">📋 Historial</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => cargarHistorial(1)}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                🔄
              </button>
              <button
                onClick={() => setAbierto(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Lista de conversaciones */}
          <div className="overflow-y-auto flex-1">
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
                <div
                  key={conv.id}
                  className="group flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <button
                    onClick={() => {
                      onSelectConversacion(conv.pregunta);
                      setAbierto(false);
                    }}
                    className="flex-1 text-left"
                  >
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {conv.pregunta}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatFecha(conv.fecha)}
                    </p>
                  </button>
                  <button
                    onClick={() => eliminarConversacion(conv.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ml-2"
                    aria-label="Eliminar conversación"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Paginación y estadísticas */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {paginacion.total} conversaciones
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => cargarHistorial(paginacion.page - 1)}
                disabled={paginacion.page <= 1}
                className="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ◀
              </button>
              <span className="text-xs text-gray-500 px-2 py-1">
                {paginacion.page} / {paginacion.pages}
              </span>
              <button
                onClick={() => cargarHistorial(paginacion.page + 1)}
                disabled={paginacion.page >= paginacion.pages}
                className="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}