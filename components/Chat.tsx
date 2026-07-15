'use client';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { titulo: string; score: number }[];
}

export default function Chat({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 ¡Bienvenido al Agente Experto SAP HCM!\n\nPregúntame sobre:\n- Configuración de nómina\n- Infotipos (PA0000, PA0001, etc.)\n- Tablas y transacciones\n- Reglas y esquemas\n- Errores y soluciones'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/consultar`,
        { pregunta: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.respuesta,
        sources: response.data.fuentes,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ Error: ${error.response?.data?.detail || 'No se pudo obtener respuesta. Verifica que el backend esté corriendo.'}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h1 className="text-2xl font-bold">🤖 Agente SAP HCM</h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-lg border border-gray-200">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
  className={`max-w-3xl p-4 rounded-lg ${
    msg.role === 'user'
      ? 'bg-blue-500 text-white'
      : 'bg-white text-gray-900 border border-gray-300'
  }`}
>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 text-xs border-t pt-2">
                  <span className="font-semibold">📚 Fuentes:</span>
                  {msg.sources.map((s, i) => (
                    <div key={i} className="ml-2 text-gray-600">
                      - {s.titulo} (score: {s.score.toFixed(2)})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 p-4 rounded-lg shadow-md">
              <span className="animate-pulse">⏳ Pensando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-white border-t">
<input
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Escribe tu pregunta sobre SAP HCM..."
  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
  disabled={loading}
/>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}