export const TICKET_ORDER_STATUS = {
  pending: 'Aguardando contato',
  awaiting_payment: 'Aguardando pagamento',
  confirmed: 'Pago',
  waitlist: 'Lista de espera',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

export const TICKET_ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Aguardando contato' },
  { value: 'awaiting_payment', label: 'Aguardando pagamento' },
  { value: 'confirmed', label: 'Pago' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'refunded', label: 'Reembolsado' },
];

export const EMISSION_STATUS = {
  not_issued: 'Não emitido',
  issued: 'Emitido',
  revoked: 'Revogado',
};

export const STORE_ORDER_STATUS = {
  awaiting_contact: 'Aguardando contato',
  awaiting_payment: 'Aguardando pagamento',
  paid: 'Pago',
  in_production: 'Em produção',
  ready: 'Disponível para retirada',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  pending: 'Pendente',
  confirmed: 'Confirmado',
};

export const STORE_ORDER_STATUS_OPTIONS = [
  { value: 'awaiting_contact', label: 'Aguardando contato' },
  { value: 'awaiting_payment', label: 'Aguardando pagamento' },
  { value: 'paid', label: 'Pago' },
  { value: 'in_production', label: 'Em produção' },
  { value: 'ready', label: 'Disponível para retirada' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'refunded', label: 'Reembolsado' },
];

export const STORE_STATUS_FLOW = [
  { value: 'awaiting_contact', label: 'Aguardando contato' },
  { value: 'awaiting_payment', label: 'Aguardando pagamento' },
  { value: 'in_production', label: 'Em produção' },
  { value: 'ready', label: 'Disponível para retirada' },
  { value: 'delivered', label: 'Entregue' },
];

export const TICKET_STATE = {
  valid: 'Válido',
  used: 'Utilizado',
  cancelled: 'Cancelado',
  expired: 'Expirado',
  refunded: 'Reembolsado',
};

export const TICKET_STATE_OPTIONS = [
  { value: 'valid', label: 'Válido' },
  { value: 'used', label: 'Utilizado' },
  { value: 'expired', label: 'Expirado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'refunded', label: 'Reembolsado' },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pagamento pendente' },
  { value: 'confirmed', label: 'Pagamento confirmado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'refunded', label: 'Reembolsado' },
];

export function isTicketExpired(ticket) {
  if (!ticket) return false;
  if (ticket.status === 'expired') return true;
  if (!ticket.valid_until) return false;
  return new Date(ticket.valid_until).getTime() < Date.now();
}

export function ticketValidityLabel(ticket) {
  if (ticket.status === 'used') return 'Utilizado — entrada já registrada';
  if (ticket.status === 'cancelled') return 'Cancelado — entrada não permitida';
  if (ticket.status === 'refunded') return 'Reembolsado — entrada não permitida';
  if (isTicketExpired(ticket)) return 'Expirado após o encerramento do evento';
  if (!ticket.valid_until) return 'Válido para o evento';
  return `Válido para entrada até ${new Date(ticket.valid_until).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function openWhatsapp(url) {
  if (!url) return false;
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  return Boolean(opened);
}

export function whatsappLink(phone, text) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  const full = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}