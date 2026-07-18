'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import UserMenu from './UserMenu';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import Historial from './Historial';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { titulo: string; score: number }[];
  timestamp?: Date;
  fuente_detalle?: string;
  id?: string;
  imagen?: string;
  imagen_texto?: string;
}

const SUGERENCIAS = [
  "¿Cómo configuro el infotipo 0008?",
  "¿Qué hace la transacción PA40?",
  "¿Cómo se calcula el salario base?",
  "¿Qué tablas usa el esquema D000?",
  "¿Cómo crear una PCR?",
];

export default function Chat({ token, onLogout, username }: { token: string; onLogout: () => void; username?: string }) {
  // ====== ESTADOS ======
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: username 
        ? `👋 ¡Bienvenido, ${username}! Soy tu Agente Experto SAP HCM.\n\nPregúntame sobre:\n• Configuración de nómina\n• Infotipos (PA0000, PA0001, etc.)\n• Tablas y transacciones\n• Reglas y esquemas\n• Errores y soluciones\n\n📎 Puedes adjuntar imágenes de errores para un análisis más preciso.`
        : `👋 ¡Bienvenido al Agente Experto SAP HCM!\n\nPregúntame sobre:\n• Configuración de nómina\n• Infotipos (PA0000, PA0001, etc.)\n• Tablas y transacciones\n• Reglas y esquemas\n• Errores y soluciones\n\n📎 Puedes adjuntar imágenes de errores para un análisis más preciso.`,
      timestamp: new Date(),
      id: 'welcome'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState('Consultando documentación...');
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, string>>({});
  const [userFullName, setUserFullName] = useState<string>(username || '');
  
  // ====== ESTADOS PARA IMÁGENES ======
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [idiomaOCR, setIdiomaOCR] = useState('spa+eng'); // 🆕 Idioma para OCR
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ====== OBTENER NOMBRE COMPLETO DEL USUARIO ======
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
        const response = await axios.get(`${API_URL}/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data;
        if (data.nombre && data.apellido) {
          setUserFullName(`${data.nombre} ${data.apellido}`);
        } else if (data.nombre) {
          setUserFullName(data.nombre);
        }
      } catch (error) {
        console.error('Error obteniendo datos del usuario:', error);
      }
    };
    fetchUserData();
  }, []);

  // ====== GUARDAR CONVERSACIÓN ======
  const guardarConversacion = async (messagesActuales: Message[]) => {
    if (!token || messagesActuales.length === 0) return;
    if (messagesActuales.length % 2 !== 0) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      const primerMensajeUsuario = messagesActuales.find(m => m.role === 'user');
      const titulo = primerMensajeUsuario?.content?.slice(0, 50) || 'Nueva conversación';
      
      const mensajesParaGuardar = messagesActuales.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp?.toISOString() || new Date().toISOString(),
        imagen: m.imagen || null,
        imagen_texto: m.imagen_texto || null
      }));
      
      const formData = new URLSearchParams();
      formData.append('titulo', titulo);
      formData.append('mensajes', JSON.stringify(mensajesParaGuardar));

      await axios.post(`${API_URL}/conversaciones/guardar`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    } catch (error) {
      console.error('Error guardando conversación:', error);
    }
  };

  // ====== EFECTO PARA GUARDAR AUTOMÁTICAMENTE ======
  useEffect(() => {
    if (messages.length > 0 && messages.length % 2 === 0) {
      guardarConversacion(messages);
    }
  }, [messages]);

  // ====== ROTAR MENSAJES DE CARGA ======
  useEffect(() => {
    if (loading) {
      const textos = ['🔍 Consultando documentación...', '🌐 Buscando en internet...', '🧠 Generando respuesta...'];
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % textos.length;
        setLoadingText(textos[index]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  // ====== AUTO-SCROLL ======
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ====== MANEJAR SUBIDA DE IMAGEN ======
  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ La imagen no debe superar los 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('❌ El archivo debe ser una imagen');
        return;
      }
      
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagen(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ====== ELIMINAR IMAGEN ======
  const eliminarImagen = () => {
    setImagen(null);
    setPreviewImagen(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ====== ENVIAR MENSAJE CON IMAGEN ======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !imagen) || loading || subiendoImagen) return;

    setLoading(true);
    setSubiendoImagen(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      
      // 1. Agregar mensaje del usuario
      const userContent = input.trim() 
        ? (imagen ? `${input.trim()} [📎 Imagen adjunta]` : input.trim())
        : '📎 Análisis de imagen';
      
      const userMessage: Message = {
        role: 'user',
        content: userContent,
        timestamp: new Date(),
        imagen: previewImagen || undefined
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      // 2. Si hay imagen, usar endpoint especial
      let response;
      if (imagen) {
        const formData = new FormData();
        formData.append('pregunta', input.trim() || 'Analiza esta imagen');
        formData.append('imagen', imagen);
        formData.append('idioma_ocr', idiomaOCR); // 🆕 Enviar idioma seleccionado
        
        response = await axios.post(
          `${API_URL}/consultar-con-imagen`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        eliminarImagen();
      } else {
        // 3. Consulta normal sin imagen
        response = await axios.post(
          `${API_URL}/consultar`,
          { pregunta: input },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // 4. Agregar respuesta del asistente
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.respuesta || 'No se pudo obtener respuesta.',
        sources: response.data.fuentes || [],
        timestamp: new Date(),
        fuente_detalle: response.data.texto_extraido 
          ? '🔍 Análisis de imagen con OCR' 
          : response.data.fuente_detalle || '',
        imagen_texto: response.data.texto_extraido || undefined
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error: any) {
      console.error('Error:', error);
      
      let mensajeError = '';
      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail || '';
        
        if (status === 401) {
          mensajeError = '⏳ Tu sesión ha expirado. Inicia sesión nuevamente.';
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.reload();
          }, 3000);
        } else if (status === 429) {
          mensajeError = '📈 Demasiadas consultas. Espera unos segundos.';
        } else if (status === 500) {
          mensajeError = '🔧 Error en el servidor. Intentamos solucionarlo.';
        } else {
          mensajeError = `❌ Error: ${detail || 'Intenta nuevamente.'}`;
        }
      } else if (error.request) {
        mensajeError = '🌐 No se pudo conectar con el servidor. Verifica tu conexión.';
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
      setSubiendoImagen(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // ====== COPIAR AL PORTAPAPELES ======
  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // ====== CARGAR CONVERSACIÓN DEL HISTORIAL ======
  const cargarConversacion = (pregunta: string) => {
    setInput(pregunta);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
      const inputContainer = document.querySelector('.border-t.border-gray-200');
      if (inputContainer) {
        inputContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // ====== FEEDBACK ======
  const handleFeedback = async (messageId: string, tipo: 'positive' | 'negative') => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agente-sap-hcm.onrender.com';
      await axios.post(
        `${API_URL}/feedback`,
        { messageId, tipo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbackStatus(prev => ({ ...prev, [messageId]: tipo }));
      setTimeout(() => {
        setFeedbackStatus(prev => {
          const newState = { ...prev };
          delete newState[messageId];
          return newState;
        });
      }, 3000);
    } catch (error) {
      console.error('Error enviando feedback:', error);
    }
  };

  // ====== RENDERIZAR CONTENIDO MARKDOWN ======
  const renderContent = (content: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <CodeBlock className={className}>
                {String(children).replace(/\n$/, '')}
              </CodeBlock>
            ) : (
              <code className={`${className} bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm`} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <div className="my-2">{children}</div>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // ====== RENDER ======
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* HEADER */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                Agente <span className="text-blue-600">SAP</span> HCM
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 hidden sm:block">Experto en Recursos Humanos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Historial token={token} onSelectConversacion={cargarConversacion} />
            <UserMenu username={userFullName || username || 'Usuario'} onLogout={onLogout} />
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:py-6 max-w-5xl mx-auto w-full">
        <div className="space-y-4 sm:space-y-6">
          {/* SUGERENCIAS */}
          {messages.length === 1 && (
            <div className="mb-4 sm:mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">💡 Preguntas sugeridas:</p>
              <div className="flex flex-wrap gap-2">
                {SUGERENCIAS.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(sug);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-105"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MENSAJES */}
          {messages.map((msg, idx) => {
            const messageId = msg.id || `msg-${idx}`;
            return (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-3xl p-3 sm:p-4 rounded-2xl shadow-sm ${
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
                    <div className="flex-1 min-w-0">
                      <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base break-words">
                        {renderContent(msg.content)}
                      </div>
                      
                      {/* IMAGEN EN MENSAJE DE USUARIO */}
                      {msg.role === 'user' && msg.imagen && (
                        <div className="mt-3">
                          <img 
                            src={msg.imagen} 
                            alt="Imagen adjunta" 
                            className="max-w-full sm:max-w-xs rounded-lg border border-gray-200 dark:border-gray-700 max-h-48 object-contain"
                          />
                        </div>
                      )}
                      
                      {/* TEXTO EXTRAÍDO DE IMAGEN */}
                      {msg.imagen_texto && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs">
                          <p className="text-gray-500 dark:text-gray-400 font-medium">📝 Texto extraído:</p>
                          <p className="text-gray-600 dark:text-gray-300 mt-1 max-h-20 overflow-y-auto">
                            {msg.imagen_texto}
                          </p>
                        </div>
                      )}
                      
                      {/* BADGE DE FUENTE */}
                      {msg.fuente_detalle && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            msg.fuente_detalle.includes('internet') 
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : msg.fuente_detalle.includes('OCR')
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : msg.fuente_detalle.includes('documentación')
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {msg.fuente_detalle}
                          </span>
                        </div>
                      )}
                      
                      {/* FEEDBACK */}
                      {msg.role === 'assistant' && msg.id !== 'welcome' && (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <button
                            onClick={() => handleFeedback(messageId, 'positive')}
                            className={`text-sm transition-all ${
                              feedbackStatus[messageId] === 'positive' 
                                ? 'text-green-600 scale-110' 
                                : 'text-gray-400 hover:text-green-600 hover:scale-110'
                            }`}
                            aria-label="Respuesta útil"
                          >
                            👍
                          </button>
                          <button
                            onClick={() => handleFeedback(messageId, 'negative')}
                            className={`text-sm transition-all ${
                              feedbackStatus[messageId] === 'negative' 
                                ? 'text-red-600 scale-110' 
                                : 'text-gray-400 hover:text-red-600 hover:scale-110'
                            }`}
                            aria-label="Respuesta no útil"
                          >
                            👎
                          </button>
                          {feedbackStatus[messageId] && (
                            <span className="text-xs text-gray-400 animate-in fade-in">
                              {feedbackStatus[messageId] === 'positive' ? '¡Gracias! 👍' : 'Gracias por tu feedback 👎'}
                            </span>
                          )}
                          <button
                            onClick={() => copyToClipboard(msg.content, messageId)}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-auto"
                          >
                            {copiedMessageId === messageId ? '✅ Copiado!' : '📋 Copiar'}
                          </button>
                        </div>
                      )}
                      
                      {/* FUENTES */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">📚 Fuentes:</p>
                          <div className="space-y-1">
                            {msg.sources.map((s, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{s.titulo}</span>
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
          
          {/* LOADING */}
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

      {/* INPUT */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex flex-col gap-3">
          <div className="flex gap-2 sm:gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Describe el error o escribe tu pregunta... (Shift+Enter para nueva línea)"
              rows={1}
              className="flex-1 px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 placeholder-gray-400 dark:placeholder-gray-500 resize-none max-h-48 overflow-y-auto"
              disabled={loading || subiendoImagen}
              style={{ minHeight: '52px' }}
            />
            
            {/* Botón de imagen */}
            <label className="cursor-pointer flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
                className="hidden"
                disabled={loading || subiendoImagen}
              />
              <div 
                className={`h-full px-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                  (loading || subiendoImagen) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Adjuntar imagen"
              >
                <span className="text-xl">📎</span>
              </div>
            </label>
            
            <button
              type="submit"
              disabled={loading || subiendoImagen || (!input.trim() && !imagen)}
              className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-indigo-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl active:scale-95 flex-shrink-0"
            >
              {loading || subiendoImagen ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span className="hidden sm:inline">{subiendoImagen ? 'Subiendo...' : 'Enviando...'}</span>
                </span>
              ) : (
                'Enviar'
              )}
            </button>
          </div>
          
          {/* PREVISUALIZACIÓN DE IMAGEN CON SELECTOR DE IDIOMA */}
          {previewImagen && (
            <div className="flex flex-wrap items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-in fade-in">
              <img 
                src={previewImagen} 
                alt="Vista previa" 
                className="h-12 sm:h-16 w-auto rounded border border-gray-300 dark:border-gray-600 object-contain"
              />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px] sm:max-w-xs">
                {imagen?.name}
              </span>
              
              {/* 🆕 SELECTOR DE IDIOMA OCR */}
              <div className="flex items-center gap-2 ml-auto">
                <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  🌍 Idioma:
                </label>
                <select
                  value={idiomaOCR}
                  onChange={(e) => setIdiomaOCR(e.target.value)}
                  className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading || subiendoImagen}
                >
                  <option value="spa+eng">🇪🇸 Español + Inglés</option>
                  <option value="spa">🇪🇸 Solo Español</option>
                  <option value="eng">🇬🇧 Solo Inglés</option>
                  <option value="spa+eng+por">🌎 Español + Inglés + Portugués</option>
                  <option value="fra">🇫🇷 Francés</option>
                  <option value="deu">🇩🇪 Alemán</option>
                  <option value="ita">🇮🇹 Italiano</option>
                  <option value="por">🇵🇹 Portugués</option>
                  <option value="auto">🤖 Detección automática</option>
                </select>
              </div>
              
              <button
                type="button"
                onClick={eliminarImagen}
                className="text-red-500 hover:text-red-700 text-sm p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}