import React from 'react';

const EVENT_STATUS = {
  draft: { label: 'Rascunho', className: 'bg-slate-200 text-slate-700' },
  published: { label: 'Publicado', className: 'bg-emerald-100 text-emerald-800' },
  sold_out: { label: 'Esgotado', className: 'bg-amber-100 text-amber-900' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
  finished: { label: 'Encerrado', className: 'bg-slate-200 text-slate-600' },
};

const POST_STATUS = {
  draft: { label: 'Rascunho', className: 'bg-slate-200 text-slate-700' },
  published: { label: 'Publicado', className: 'bg-emerald-100 text-emerald-800' },
  archived: { label: 'Arquivado', className: 'bg-slate-200 text-slate-600' },
};

const PRODUCT_STATUS = {
  draft: { label: 'Rascunho', className: 'bg-slate-200 text-slate-700' },
  published: { label: 'Publicado', className: 'bg-emerald-100 text-emerald-800' },
  archived: { label: 'Arquivado', className: 'bg-slate-200 text-slate-600' },
};

const PAYMENT_STATUS = {
  pending: { label: 'Pagamento pendente', className: 'bg-amber-100 text-amber-900' },
  confirmed: { label: 'Pagamento confirmado', className: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', className: 'bg-slate-200 text-slate-700' },
  not_required: { label: 'Sem cobrança', className: 'bg-slate-200 text-slate-700' },
};

const REGISTRATION_STATUS = {
  pending: { label: 'Aguardando contato', className: 'bg-amber-100 text-amber-900' },
  awaiting_payment: { label: 'Aguardando pagamento', className: 'bg-sky-100 text-sky-800' },
  confirmed: { label: 'Pago', className: 'bg-emerald-100 text-emerald-800' },
  waitlist: { label: 'Lista de espera', className: 'bg-sky-100 text-sky-800' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', className: 'bg-slate-200 text-slate-700' },
};

const TICKET_STATUS = {
  valid: { label: 'Válido', className: 'bg-emerald-100 text-emerald-800' },
  used: { label: 'Utilizado', className: 'bg-slate-200 text-slate-700' },
  expired: { label: 'Expirado', className: 'bg-slate-200 text-slate-600' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', className: 'bg-red-100 text-red-800' },
};

const ORDER_STATUS = {
  awaiting_contact: { label: 'Aguardando contato', className: 'bg-amber-100 text-amber-900' },
  awaiting_payment: { label: 'Aguardando pagamento', className: 'bg-sky-100 text-sky-800' },
  paid: { label: 'Pago', className: 'bg-emerald-100 text-emerald-800' },
  in_production: { label: 'Em produção', className: 'bg-indigo-100 text-indigo-800' },
  ready: { label: 'Disponível para retirada', className: 'bg-sky-100 text-sky-800' },
  delivered: { label: 'Entregue', className: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', className: 'bg-slate-200 text-slate-700' },
  pending: { label: 'Pendente', className: 'bg-amber-100 text-amber-900' },
  confirmed: { label: 'Confirmado', className: 'bg-emerald-100 text-emerald-800' },
};

const MAPS = {
  event: EVENT_STATUS,
  post: POST_STATUS,
  product: PRODUCT_STATUS,
  payment: PAYMENT_STATUS,
  registration: REGISTRATION_STATUS,
  ticket: TICKET_STATUS,
  order: ORDER_STATUS,
};

export default function StatusBadge({ kind = 'event', value, className = '' }) {
  const map = MAPS[kind] || {};
  const entry = map[value];
  if (!entry) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${entry.className} ${className}`}
    >
      {entry.label}
    </span>
  );
}

export function statusLabel(kind, value) {
  return MAPS[kind]?.[value]?.label || value || '—';
}