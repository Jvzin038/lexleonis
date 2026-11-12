import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import TicketQrCode from '@/components/site/TicketQrCode';

export default function TicketZoom({ ticket }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ampliar o QR Code do ingresso"
        className="relative rounded-xl"
      >
        <TicketQrCode code={ticket.code} size={176} />
        <span className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-deep/90 text-white">
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogTitle className="pr-8 font-heading text-sm uppercase tracking-[0.14em] text-brand-deep">
            {ticket.event_title || 'Ingresso'}
          </DialogTitle>
          <div className="flex flex-col items-center gap-3">
            <TicketQrCode code={ticket.code} size={280} />
            <p className="break-all font-mono text-sm tracking-[0.12em] text-slate-600">{ticket.code}</p>
            <p className="text-xs text-slate-500">
              Aumente o brilho da tela para facilitar a leitura na portaria.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}