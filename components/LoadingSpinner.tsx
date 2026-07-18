'use client';

interface LoadingSpinnerProps {
  tamaño?: 'sm' | 'md' | 'lg';
  texto?: string;
}

export default function LoadingSpinner({ tamaño = 'md', texto = '' }: LoadingSpinnerProps) {
  const tamaños = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`${tamaños[tamaño]} border-blue-600 border-t-transparent rounded-full animate-spin`}
      ></div>
      {texto && <p className="text-sm text-gray-500 dark:text-gray-400">{texto}</p>}
    </div>
  );
}