'use client';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { titulo: string; score: number }[];
  timestamp?: Date;
}

const SUGERENCIAS = [
  "¿Cómo configuro el infotipo 0008?",
  "¿Qué hace la transacción PA40?",
  "¿Cómo se calcula el salario base?",
  "¿Qué tablas usa el esquema D000?",
  "¿Cómo crear una PCR?",
];

export default function Chat({ token, onLogout, username }: { token: string; onLogout: () => void; username?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: username 
        ? `👋 ¡Bienvenido, ${username}! Soy tu Agente Experto SAP HCM.\n\nPregúntame sobre:\n• Configuración de nómina\n• Infotipos (PA0000, PA0001, etc.)\n• Tablas y transacciones\n• Reglas y esquemas\n• Errores y soluciones`
        : `👋 ¡Bienvenido al Agente Experto SAP HCM!\n\nPregúntame sobre:\n• Configuración de nómina\n• Infotipos (PA0000, PA0001, etc.)\n• Tablas y transacciones\n• Reglas y esquemas\n• Errores y soluciones`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.post(
        `${API_URL}/consultar`,
        { pregunta: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.respuesta || 'No se pudo obtener respuesta.',
        sources: response.data.fuentes || [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error: ${error.response?.data?.detail || error.message || 'No se pudo obtener respuesta.'}`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Función para renderizar el contenido con formato
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Títulos con ** **
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={idx} className="font-bold text-blue-700 mt-2">{line.replace(/\*\*/g, '')}</div>;
      }
      // Subtítulos con ###
      if (line.startsWith('###')) {
        return <div key={idx} className="font-semibold text-gray-800 mt-3">{line.replace(/###/g, '').trim()}</div>;
      }
      // Viñetas
      if (line.startsWith('- ')) {
        return <div key={idx} className="flex items-start gap-2 ml-2">
          <span className="text-blue-500">•</span>
          <span>{line.substring(2)}</span>
        </div>;
      }
      // Pasos numerados (1., 2., etc.)
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return <div key={idx} className="flex items-start gap-2 ml-2">
          <span className="font-bold text-blue-600 min-w-[20px]">{numMatch[1]}.</span>
          <span>{numMatch[2]}</span>
        </div>;
      }
      // Líneas vacías
      if (!line.trim()) {
        return <br key={idx} />;
      }
      // Texto normal
      return <div key={idx} className="leading-relaxed">{line}</div>;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Agente <span className="text-blue-600">SAP</span> HCM
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Experto en Recursos Humanos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-5xl mx-auto w-full">
        <div className="space-y-6">
          {/* Sugerencias */}
          {messages.length === 1 && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3">💡 Preguntas sugeridas:</p>
              <div className="flex flex-wrap gap-2">
                {SUGERENCIAS.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(sug);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-3xl p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      S
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {renderContent(msg.content)}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-2">📚 Fuentes consultadas:</p>
                        <div className="space-y-1">
                          {msg.sources.map((s, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                              <span className="text-xs text-gray-600">{s.titulo}</span>
                              <span className="text-xs text-gray-400">({(s.score * 100).toFixed(0)}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {msg.timestamp && msg.role === 'assistant' && (
                      <p className="text-xs text-gray-400 mt-2">
                        {msg.timestamp.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      U
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-none shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    S
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta sobre SAP HCM..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 text-gray-800 bg-white"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {loading ? '⏳' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
}