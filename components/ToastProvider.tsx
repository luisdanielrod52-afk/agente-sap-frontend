'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ToastContextType {
  showToast: (mensaje: string, tipo: 'success' | 'error' | 'info' | 'warning') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; mensaje: string; tipo: 'success' | 'error' | 'info' | 'warning' }[]>([]);

  const showToast = (mensaje: string, tipo: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-lg border-l-4 animate-in slide-in-from-right-5 ${
              toast.tipo === 'success' ? 'bg-green-50 border-green-500 text-green-700' :
              toast.tipo === 'error' ? 'bg-red-50 border-red-500 text-red-700' :
              toast.tipo === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' :
              'bg-blue-50 border-blue-500 text-blue-700'
            }`}
          >
            <p className="text-sm font-medium">{toast.mensaje}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}