'use client';
import { useState, useEffect } from 'react';
import Login from '@/components/Login';
import Chat from '@/components/Chat';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    setUsername('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return <Chat token={token} onLogout={handleLogout} username={username} />;
}