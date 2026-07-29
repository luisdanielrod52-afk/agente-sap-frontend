import { ReactNode } from 'react';
import '../globals.css';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900">
        {children}
      </body>
    </html>
  );
}