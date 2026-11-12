import React from 'react';
import { Link } from '@/lib/router-compat';
import { CalendarDays, Clock, MapPin, Ticket as TicketIcon, UserRound } from 'lucide-react';
import TicketZoom from '@/components/student/TicketZoom';
import { formatDate, formatTime } from '@/lib/format';
import { ticketValidityLabel } from '@/lib/orderStatus';

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[0.65rem] uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className="truncate text-sm text-brand-deep">{value || '—'}</p>
      </div>
    </div>
  );
}

const STATE_STYLES = {
  valid: 'border-brand-primary/30',
  used: 'border-slate-200',
  expired: 'border-slate-200',
  cancelled: 'border-red-200',
  refunded: 'border-red-200',
};

export default function TicketCard({ ticket }) {
  const state = ticket.status || 'valid';
  const active = state === 'valid';

  return (
    <div className={`overflow-hidden rounded-2xl border bg-white ${STATE_STYLES[state] || 'border-slate-200'}`}>
      <div
        className={`flex items-center justify-between px-5 py-4 text-white ${
          active ? 'bg-brand-deep' : 'bg-slate-700'
        }`}
      >
        <div className="min-w-0">
          <p className="font-heading text-xs uppercase tracking-[0.18em] text-brand-gold">
            {active ? 'Ingresso digital' : 'Ingresso'}
          </p>
          <p className="mt-1 truncate text-sm font-medium">{ticket.event_title || 'Evento'}</p>
        </div>
        <TicketIcon className="h-5 w-5 shrink-0 text-brand-gold" />
      </div>

      <div className="flex flex-col gap-5 p-5 sm:flex-row">
        <div className="flex flex-col items-center gap-3">
          <TicketZoom ticket={ticket} />
          <p className="break-all font-mono text-xs tracking-[0.12em] text-slate-500">{ticket.code}</p>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <p
            className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] ${
              active
                ? 'bg-emerald-50 text-emerald-800'
                : state === 'used'
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-red-50 text-red-700'
            }`}
          >
            {ticketValidityLabel(ticket)}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Detail icon={UserRound} label="Participante" value={ticket.participant_name || ticket.holder_name} />
            <Detail icon={TicketIcon} label="Tipo de ingresso" value={ticket.ticket_type_name} />
            <Detail icon={CalendarDays} label="Data" value={formatDate(ticket.event_date)} />
            <Detail icon={Clock} label="Horário" value={formatTime(ticket.event_start_time)} />
            <div className="sm:col-span-2">
              <Detail icon={MapPin} label="Local" value={ticket.event_location} />
            </div>
            {ticket.participant_cpf && (
              <Detail icon={UserRound} label="CPF" value={ticket.participant_cpf} />
            )}
            {ticket.participant_email && (
              <Detail icon={UserRound} label="E-mail" value={ticket.participant_email} />
            )}
          </div>

          <dl className="space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div className="flex justify-between gap-4">
              <dt>Identificador</dt>
              <dd className="font-mono">{ticket.code}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Pedido</dt>
              <dd className="font-mono">{ticket.order_number || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Pagamento</dt>
              <dd>{ticket.payment_status === 'confirmed' ? 'Confirmado' : ticket.payment_status === 'not_required' ? 'Sem cobrança' : 'Pendente'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Utilização</dt>
              <dd>
                {ticket.checked_in_at
                  ? `Entrada registrada em ${new Date(ticket.checked_in_at).toLocaleString('pt-BR')}`
                  : 'Ainda não utilizado'}
              </dd>
            </div>
          </dl>

          {ticket.event_id && (
            <Link
              to={`/eventos/${ticket.event_id}`}
              className="inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary hover:text-brand-deep"
            >
              Detalhes do evento
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}