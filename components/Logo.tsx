'use client';
import React from 'react';

export default function Logo() {
  return (
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
  );
}