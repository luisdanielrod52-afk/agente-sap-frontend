import { ReactNode } from 'react';
import RootLayout from '../layout';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>; // 🔥 Promise para Next.js 16
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params; // 🔥 Esperar el promise
  
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}

// 🔥 Generar rutas estáticas para cada idioma
export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }];
}