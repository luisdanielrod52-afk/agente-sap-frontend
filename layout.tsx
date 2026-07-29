import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  params: {
    lang: string;
  };
}

export default function Layout({ children, params }: LayoutProps) {
  return (
    <html lang={params.lang}>
      <body>{children}</body>
    </html>
  );
}

// 🔥 Necesario para que Next.js entienda los parámetros dinámicos
export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }];
}