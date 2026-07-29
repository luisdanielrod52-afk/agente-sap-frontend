'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Detectar idioma actual de la URL
  const currentLang = pathname.startsWith('/en') ? 'en' : 'es';

  const toggleLanguage = () => {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    const newPathname = pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(newPathname);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
      aria-label="Cambiar idioma"
    >
      <span className="text-xl">
        {currentLang === 'es' ? '🇪🇸' : '🇬🇧'}
      </span>
      <span className="hidden sm:inline text-gray-700 dark:text-gray-300">
        {currentLang === 'es' ? 'ES' : 'EN'}
      </span>
    </button>
  );
}