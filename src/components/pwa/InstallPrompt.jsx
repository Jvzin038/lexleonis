import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

const DISMISS_KEY = 'lexleon-install-dismissed';

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);
  const ios = typeof window !== 'undefined' && isIOS();

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === 'true') return undefined;

    const onPrompt = (event) => {
      event.preventDefault();
      setDeferred(event);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // No iPhone/iPad não existe convite automático: mostramos as instruções
    if (isIOS()) setVisible(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try {
      await deferred.userChoice;
    } catch (error) {
      /* o convite pode ser fechado sem escolha */
    }
    setDeferred(null);
    setVisible(false);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3">
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-brand-gold/30 bg-brand-deep px-4 py-3 text-white shadow-xl">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold text-brand-ink">
          {ios ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Instale o app da Lex Leonis</p>
          <p className="text-xs text-white/70">
            {ios
              ? 'Toque em Compartilhar e depois em “Adicionar à Tela de Início”.'
              : 'Tenha tudo na tela inicial do celular e use mesmo sem internet.'}
          </p>
        </div>
        {!ios && (
          <button
            type="button"
            onClick={install}
            className="shrink-0 rounded-full bg-brand-gold px-4 py-2 text-xs font-semibold text-brand-ink"
          >
            Instalar
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fechar aviso de instalação"
          className="shrink-0 rounded-full p-1 text-white/60 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}