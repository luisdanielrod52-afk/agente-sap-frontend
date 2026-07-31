'use client';

import { useRouter } from 'next/navigation';

interface UpgradeButtonProps {
  plan?: string;
  className?: string;
}

export default function UpgradeButton({ plan = 'gratis', className = '' }: UpgradeButtonProps) {
  const router = useRouter();

  // Si el usuario ya tiene Pro o Empresa, no mostrar el botón
  if (plan !== 'gratis') {
    return null;
  }

  return (
    <button
      onClick={() => router.push('/es/pricing')}
      className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg ${className}`}
    >
      ⭐ Actualizar a Pro
    </button>
  );
}