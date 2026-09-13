import React, { useState } from 'react';
import { usePWAInstall } from '../usePWAInstall';
import { Download, AlertCircle } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return (
      <div className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-50 text-slate-500 rounded-xl font-medium text-sm border border-slate-200">
        Aplicativo já instalado
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-sm hover:bg-emerald-100 transition-colors"
      >
        <Download size={16} />
        Baixar Aplicativo
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-sm hover:bg-emerald-100 transition-colors"
        >
          <Download size={16} />
          Instalar no iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-800">Instalar no iPhone / iPad</h3>
              <p className="mt-2 text-sm text-slate-600 space-y-2">
                1. Toque no botão de <strong>Compartilhar</strong> na barra do Safari (ícone quadrado com uma seta para cima).<br />
                2. Role a lista e toque em <strong>Adicionar à Tela de Início</strong> (Add to Home Screen).
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers that don't support automatic installation (like Desktop Safari, or when opened directly in AI Studio)
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-600 flex items-start gap-2">
      <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-slate-700 mb-1">Instalação Indisponível</p>
        <p className="text-xs">
          Para instalar este app, abra o site no Chrome (Android) ou Safari (iOS).
        </p>
      </div>
    </div>
  );
};
