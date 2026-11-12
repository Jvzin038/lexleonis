import React, { useEffect, useState } from 'react';
import { Loader2, QrCode } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TicketQrCode({ code, size = 220, className = '' }) {
  const [state, setState] = useState({ loading: true, rows: [], error: '' });

  useEffect(() => {
    let active = true;
    if (!code) return undefined;
    setState({ loading: true, rows: [], error: '' });
    (async () => {
      try {
        const response = await base44.functions.invoke('ticketQr', { code });
        if (!active) return;
        setState({ loading: false, rows: response.data?.rows || [], error: '' });
      } catch (error) {
        if (active) {
          setState({ loading: false, rows: [], error: 'Não foi possível carregar o QR Code.' });
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [code]);

  if (state.loading) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white ${className}`}
        style={{ width: size, height: size }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (state.error || state.rows.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white text-center ${className}`}
        style={{ width: size, height: size }}
      >
        <QrCode className="h-8 w-8 text-slate-300" />
        <p className="px-4 text-xs text-slate-500">{state.error || 'QR Code indisponível.'}</p>
      </div>
    );
  }

  const margin = 3;
  const total = state.rows.length + margin * 2;

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      width={size}
      height={size}
      role="img"
      aria-label={`QR Code do ingresso ${code}`}
      className={`rounded-xl border border-slate-200 bg-white ${className}`}
    >
      <rect x="0" y="0" width={total} height={total} fill="#ffffff" />
      {state.rows.map((row, rowIndex) =>
        row.split('').map((cell, colIndex) =>
          cell === '1' ? (
            <rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex + margin}
              y={rowIndex + margin}
              width="1"
              height="1"
              fill="#111111"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}