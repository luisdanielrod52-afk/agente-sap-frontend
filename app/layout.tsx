import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  params?: {
    lang: string;
  };
}

export default function LangLayout({ children, params }: LayoutProps) {
  const lang = params?.lang || 'es';
  return (
    <div lang={lang}>
      {children}
    </div>
  );
}

// Generar rutas estáticas
export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }];
}