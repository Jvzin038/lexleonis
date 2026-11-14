import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineNotice() {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-brand-deep px-4 py-2 text-center text-xs font-medium text-brand-gold">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      Você está sem internet. Páginas já abertas e seus ingressos salvos continuam disponíveis.
    </div>
  );
}
