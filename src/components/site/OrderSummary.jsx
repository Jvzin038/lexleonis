import React from 'react';
import { formatCurrency } from '@/lib/format';

export default function OrderSummary({ event, ticketType, quantity, compact }) {
  const unitPrice = Number(ticketType?.price || 0);
  const total = unitPrice * quantity;
  const isFree = Boolean(ticketType?.is_free) || unitPrice === 0;

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${compact ? 'p-4' : 'p-5'}`}>
      <p className="font-heading text-xs uppercase tracking-[0.16em] text-brand-deep">Resumo do pedido</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">Evento</dt>
          <dd className="text-right font-medium text-brand-deep line-clamp-2">{event?.title}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">Lote</dt>
          <dd className="text-right font-medium text-brand-deep">{ticketType?.name || '—'}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">Quantidade</dt>
          <dd className="font-medium text-brand-deep">{quantity}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">Unitário</dt>
          <dd className="font-medium text-brand-deep">{isFree ? 'Gratuito' : formatCurrency(unitPrice)}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-slate-100 pt-2 text-base font-semibold text-brand-deep">
          <dt>Total</dt>
          <dd>{isFree ? 'Gratuito' : formatCurrency(total)}</dd>
        </div>
      </dl>
    </div>
  );
}