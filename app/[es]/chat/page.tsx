'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Chat from '@/components/Chat';

export default function ChatPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUsername || '');
    } else {
      router.push('/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/');
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">⏳ Cargando...</div>
      </div>
    );
  }

  return <Chat token={token} onLogout={handleLogout} username={username} />;
}