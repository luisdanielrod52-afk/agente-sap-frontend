'use client';

import { useRouter } from 'next/navigation';
import Chat from '../../../components/Chat';

export default function ChatPage() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') || undefined : undefined;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/es/login');
  };

  if (!token) {
    router.push('/es/login');
    return null;
  }

  return (
    <Chat token={token} onLogout={handleLogout} username={username} />
  );
}