'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  sources?: { titulo: string; score: number }[];
  id?: string;
}

interface ExportPDFProps {
  messages: Message[];
  username?: string;
}

export default function ExportPDF({ messages, username }: ExportPDFProps) {
  const [exportando, setExportando] = useState(false);

  // Filtrar mensajes (excluir el mensaje de bienvenida)
  const mensajesFiltrados = messages.filter(
    (msg) => msg.id !== 'welcome' && msg.role !== 'system'
  );

  // Si no hay mensajes, no mostrar el botón
  if (mensajesFiltrados.length === 0) {
    return null;
  }

  const exportarPDF = async () => {
    setExportando(true);

    try {
      // 1. Crear un contenedor temporal para el contenido del PDF
      const container = document.createElement('div');
      container.style.padding = '40px';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.backgroundColor = 'white';
      container.style.width = '800px';
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.zIndex = '9999';

      // 2. Agregar contenido al contenedor
      const titulo = document.createElement('h1');
      titulo.textContent = `📋 Conversación - Agente SAP HCM`;
      titulo.style.fontSize = '24px';
      titulo.style.color = '#1a56db';
      titulo.style.borderBottom = '2px solid #1a56db';
      titulo.style.paddingBottom = '10px';
      titulo.style.marginBottom = '20px';
      container.appendChild(titulo);

      // Información del usuario
      const info = document.createElement('p');
      info.textContent = `👤 Usuario: ${username || 'Anónimo'} | 📅 Fecha: ${new Date().toLocaleDateString('es')}`;
      info.style.fontSize = '14px';
      info.style.color = '#6b7280';
      info.style.marginBottom = '20px';
      container.appendChild(info);

      // Mensajes
      mensajesFiltrados.forEach((msg, index) => {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.style.marginBottom = '20px';
        mensajeDiv.style.padding = '15px';
        mensajeDiv.style.borderRadius = '8px';
        mensajeDiv.style.borderLeft = `4px solid ${msg.role === 'user' ? '#3b82f6' : '#10b981'}`;
        mensajeDiv.style.backgroundColor = msg.role === 'user' ? '#eff6ff' : '#f0fdf4';

        const roleLabel = document.createElement('div');
        roleLabel.textContent = msg.role === 'user' ? '👤 Usuario' : '🤖 Agente SAP HCM';
        roleLabel.style.fontWeight = 'bold';
        roleLabel.style.fontSize = '14px';
        roleLabel.style.color = msg.role === 'user' ? '#1e40af' : '#065f46';
        roleLabel.style.marginBottom = '5px';
        mensajeDiv.appendChild(roleLabel);

        const content = document.createElement('div');
        content.textContent = msg.content.replace(/\n/g, ' ');
        content.style.fontSize = '14px';
        content.style.lineHeight = '1.6';
        content.style.color = '#1f2937';
        mensajeDiv.appendChild(content);

        if (msg.timestamp) {
          const tiempo = document.createElement('div');
          tiempo.textContent = `🕐 ${new Date(msg.timestamp).toLocaleTimeString('es')}`;
          tiempo.style.fontSize = '11px';
          tiempo.style.color = '#9ca3af';
          tiempo.style.marginTop = '5px';
          mensajeDiv.appendChild(tiempo);
        }

        container.appendChild(mensajeDiv);
      });

      // Pie de página
      const footer = document.createElement('div');
      footer.textContent = '📌 Generado por Agente SAP HCM - Exportación de conversación';
      footer.style.fontSize = '12px';
      footer.style.color = '#9ca3af';
      footer.style.borderTop = '1px solid #e5e7eb';
      footer.style.paddingTop = '15px';
      footer.style.marginTop = '20px';
      footer.style.textAlign = 'center';
      container.appendChild(footer);

      document.body.appendChild(container);

      // 3. Convertir a canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // 4. Remover el contenedor temporal
      document.body.removeChild(container);

      // 5. Generar PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 190; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      // Agregar imagen de la primera página
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.height - 20;

      // Agregar páginas adicionales si es necesario
      while (heightLeft > 0) {
        pdf.addPage();
        position = 10 - (imgHeight - heightLeft);
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.height - 20;
      }

      // 6. Descargar el PDF
      const nombreArchivo = `conversacion_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(nombreArchivo);

    } catch (error) {
      console.error('Error exportando PDF:', error);
      alert('❌ Error al generar el PDF. Intenta nuevamente.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <button
      onClick={exportarPDF}
      disabled={exportando}
      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
      title="Exportar conversación a PDF"
    >
      {exportando ? (
        <>
          <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
          <span>Generando...</span>
        </>
      ) : (
        <>
          <span>📄</span>
          <span>Exportar PDF</span>
        </>
      )}
    </button>
  );
}