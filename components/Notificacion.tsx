'use client';

import { useEffect, useState } from 'react';

interface NotificacionProps {
  mensaje: string;
  tipo: 'success' | 'error' | 'info' | 'warning';
  duracion?: number;
  onClose?: () => void;
}

export default function Notificacion({ mensaje, tipo, duracion = 3000, onClose }: NotificacionProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duracion);

    return () => clearTimeout(timer);
  }, [duracion, onClose]);

  if (!visible) return null;

  const colores = {
    success: 'bg-green-50 border-green-500 text-green-700',
    error: 'bg-red-50 border-red-500 text-red-700',
    info: 'bg-blue-50 border-blue-500 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-700'
  };

  const iconos = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-xl border-l-4 shadow-lg animate-in slide-in-from-right-5 ${colores[tipo]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{iconos[tipo]}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{mensaje}</p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}