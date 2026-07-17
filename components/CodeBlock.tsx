'use client';
import { useState } from 'react';

export default function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className={`${className || ''} p-4 bg-gray-900 rounded-lg overflow-x-auto`}>
        <code className="text-sm text-gray-200 font-mono">
          {children}
        </code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded hover:bg-gray-600 transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? '✅ Copiado' : '📋 Copiar'}
      </button>
    </div>
  );
}