'use client';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { titulo: string; score: number }[];
  timestamp?: Date;
  fuente_detalle?: string;
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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState('Consultando documentación...');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  // Rotar mensajes de carga
  useEffect(() => {
    if (loading) {
      const textos = ['Consultando documentación...', 'Buscando en internet...', 'Generando respuesta...'];
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % textos.length;
        setLoadingText(textos[index]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setLoadingText('Consultando documentación...');

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
        timestamp: new Date(),
        fuente_detalle: response.data.fuente_detalle || ''
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error:', error);
      
      let mensajeError = '';
      
      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail || '';
        
        if (status === 401) {
          mensajeError = '⏳ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.reload();
          }, 3000);
        } else if (status === 429) {
          mensajeError = '📈 Has realizado demasiadas consultas en poco tiempo. Espera unos segundos y vuelve a intentarlo.';
        } else if (status === 500) {
          mensajeError = '🔧 El servidor está teniendo problemas. Nuestro equipo ya está trabajando en ello. Por favor, intenta más tarde.';
        } else {
          mensajeError = `❌ Error: ${detail || 'No se pudo procesar tu pregunta. Intenta nuevamente.'}`;
        }
      } else if (error.request) {
        mensajeError = '🌐 No pudimos conectar con el servidor. Verifica tu conexión a internet o intenta más tarde.';
      } else {
        mensajeError = `❌ Error inesperado: ${error.message || 'Intenta nuevamente.'}`;
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: mensajeError,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Renderizar contenido con negritas y formato
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    
    return lines.map((line, idx) => {
      // Convertir **texto** a negritas
      const partes = line.split(/\*\*(.*?)\*\*/g);
      
      if (partes.length > 1) {
        return (
          <div key={idx} className="leading-relaxed">
            {partes.map((part, i) => {
              if (i % 2 === 1) {
                return <strong key={i} className="font-bold text-blue-700">{part}</strong>;
              }
              return <span key={i}>{part}</span>;
            })}
          </div>
        );
      }
      
      // Títulos con ###
      if (line.startsWith('###')) {
        return <div key={idx} className="font-semibold text-gray-800 dark:text-gray-200 mt-3">{line.replace(/###/g, '').trim()}</div>;
      }
      // Viñetas
      if (line.startsWith('- ')) {
        return <div key={idx} className="flex items-start gap-2 ml-2">
          <span className="text-blue-500">•</span>
          <span>{line.substring(2)}</span>
        </div>;
      }
      // Pasos numerados
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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                Agente <span className="text-blue-600">SAP</span> HCM
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Experto en Recursos Humanos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
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
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">💡 Preguntas sugeridas:</p>
              <div className="flex flex-wrap gap-2">
                {SUGERENCIAS.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(sug);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => {
            const messageId = `msg-${idx}`;
            return (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-3xl p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'
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
                      
                      {/* Badge de fuente */}
                      {msg.fuente_detalle && (
                        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                          {msg.fuente_detalle}
                        </div>
                      )}
                      
                      {/* Botón copiar - SOLO PARA ASISTENTE */}
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(msg.content, messageId)}
                          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mt-2 flex items-center gap-1"
                        >
                          {copiedMessageId === messageId ? '✅ Copiado!' : '📋 Copiar respuesta'}
                        </button>
                      )}
                      
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">📚 Fuentes consultadas:</p>
                          <div className="space-y-1">
                            {msg.sources.map((s, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">{s.titulo}</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">({(s.score * 100).toFixed(0)}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {msg.timestamp && msg.role === 'assistant' && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {msg.timestamp.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-700 dark:bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        U
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Indicador de carga mejorado */}
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl rounded-bl-none shadow-sm max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{loadingText}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Esto puede tomar unos segundos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta sobre SAP HCM..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 placeholder-gray-400 dark:placeholder-gray-500"
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