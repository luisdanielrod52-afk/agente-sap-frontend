import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  params: { lang: string };
}

export default function Layout({ children, params }: LayoutProps) {
  return (
    <html lang={params.lang || 'es'}>
      <body>{children}</body>
    </html>
  );
}