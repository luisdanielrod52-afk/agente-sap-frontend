'use client';
import { useState } from 'react';
import Login from '@/components/Login';
import Chat from '@/components/Chat';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);

  const handleLogout = () => {
    setToken(null);
  };

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return <Chat token={token} onLogout={handleLogout} />;
}