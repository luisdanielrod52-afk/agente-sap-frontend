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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
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
  
  let mensajeError = '';
  
  if (error.response) {
    // Error del backend
    const status = error.response.status;
    const detail = error.response.data?.detail || '';
    
    if (status === 401) {
      mensajeError = '⏳ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      // Opcional: redirigir al login después de unos segundos
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.reload();
      }, 3000);
    } else if (status === 429) {
      mensajeError = '📈 Has realizado demasiadas consultas en poco tiempo. Espera unos segundos y vuelve a intentarlo.';
    } else if (status === 500) {
      mensajeError = '🔧 El servidor está teniendo problemas. Nuestro equipo ya está trabajando en ello. Por favor, intenta más tarde.';
    } else if (detail.includes('DEEPSEEK_API_KEY')) {
      mensajeError = '🔑 Error de configuración. Contacta al administrador.';
    } else {
      mensajeError = `❌ Error: ${detail || 'No se pudo procesar tu pregunta. Intenta nuevamente.'}`;
    }
  } else if (error.request) {
    // No hubo respuesta del servidor
    mensajeError = '🌐 No pudimos conectar con el servidor. Verifica tu conexión a internet o intenta más tarde.';
  } else {
    mensajeError = `❌ Error inesperado: ${error.message || 'Intenta nuevamente.'}`;
  }
  
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: mensajeError,
    timestamp: new Date()
  }]);
}

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
                      
                      {/* ✅ BOTÓN COPIAR - SOLO PARA ASISTENTE */}
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(msg.content, messageId)}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-2 flex items-center gap-1"
                        >
                          {copiedMessageId === messageId ? '✅ Copiado!' : '📋 Copiar respuesta'}
                        </button>
                      )}
                      
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
            );
          })}
          
          {loading && (
  <div className="flex justify-start animate-in fade-in duration-300">
    <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-none shadow-sm max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          S
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Buscando respuesta</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {loading ? 'Consultando documentación...' : ''}
          </p>
        </div>
      </div>
    </div>
  </div>
)}