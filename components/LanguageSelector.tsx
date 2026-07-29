'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLang = params?.lang as string || 'es';

  const toggleLanguage = () => {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    
    // Reemplazar el idioma en la URL
    const newPathname = pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(newPathname);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
      aria-label="Cambiar idioma"
    >
      <span className="text-lg">
        {currentLang === 'es' ? '🇪🇸' : '🇬🇧'}
      </span>
      <span className="hidden sm:inline">
        {currentLang === 'es' ? 'ES' : 'EN'}
      </span>
    </button>
  );
}