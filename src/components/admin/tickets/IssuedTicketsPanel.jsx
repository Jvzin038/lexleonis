import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/site/StatusBadge';
import TicketQrCode from '@/components/site/TicketQrCode';
import HistoryList from '@/components/admin/HistoryList';
import { formatDate, formatDateTime } from '@/lib/format';
import { PAYMENT_STATUS_OPTIONS, TICKET_STATE_OPTIONS, ticketValidityLabel } from '@/lib/orderStatus';

function TicketDetail({ ticket, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await base44.functions.invoke('issuedTickets', { action: 'detail', id: ticket.id });
        setHistory(response.data?.history || []);
      } catch (error) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [ticket.id]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase tracking-tight text-brand-deep">
            Ingresso {ticket.code}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2">
            <TicketQrCode code={ticket.code} size={200} />
            <p className="font-mono text-xs text-slate-500">{ticket.code}</p>
          </div>
          <dl className="flex-1 space-y-2 text-sm">
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">Evento</dt>
              <dd className="text-brand-deep">{ticket.event_title}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">Titular</dt>
              <dd>{ticket.holder_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">Tipo</dt>
              <dd>{ticket.ticket_type_name}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">Pedido</dt>
              <dd className="font-mono text-xs">{ticket.order_number || '—'}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">Emitido em</dt>
              <dd>{formatDateTime(ticket.issued_at)}</dd>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <StatusBadge kind="ticket" value={ticket.status} />
              <StatusBadge kind="payment" value={ticket.payment_status} />
            </div>
            <p className="text-xs text-slate-500">{ticketValidityLabel(ticket)}</p>
            {ticket.checked_in_at && (
              <p className="text-xs text-emerald-700">
                Entrada registrada em {formatDateTime(ticket.checked_in_at)} por {ticket.checked_in_by_name || ticket.checked_in_by}
              </p>
            )}
            {ticket.revoked_reason && <p className="text-xs text-red-700">Motivo: {ticket.revoked_reason}</p>}
          </dl>
        </div>

        <div>
          <p className="font-heading text-sm uppercase tracking-[0.14em] text-brand-deep">Histórico de validações</p>
          <div className="mt-3">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <HistoryList items={history} moduleLabel="Portaria" />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function IssuedTicketsPanel({ events }) {
  const [filters, setFilters] = useState({ event_id: '', status: '', payment_status: '', search: '' });
  const [state, setState] = useState({ items: [], counts: { status: [], payment: [] } });
  const [loading, setLoading] = useState(true);
  const [openTicket, setOpenTicket] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('issuedTickets', { action: 'list', ...filters });
      setState({
        items: response.data?.items || [],
        counts: response.data?.counts || { status: [], payment: [] },
      });
    } catch (error) {
      setState({ items: [], counts: { status: [], payment: [] } });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const statusCount = (value) => state.counts.status.find((row) => row.status === value)?.count || 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-heading text-base uppercase tracking-tight text-brand-deep">Ingressos emitidos</h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Consulte os ingressos emitidos, veja o QR Code, a validade e o histórico de entrada de cada um.
          </p>
        </div>
        <Button variant="outline" onClick={load} className="rounded-full">
          <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Buscar por código, titular ou pedido…"
            className="pl-9"
          />
        </div>
        <select
          value={filters.event_id}
          onChange={(event) => setFilters((current) => ({ ...current, event_id: event.target.value }))}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">Todos os eventos</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">Todas as situações</option>
          {TICKET_STATE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={filters.payment_status}
          onChange={(event) => setFilters((current) => ({ ...current, payment_status: event.target.value }))}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">Todos os pagamentos</option>
          {PAYMENT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="rounded-full bg-emerald-50 px-3 py-1">Válidos: {statusCount('valid')}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Utilizados: {statusCount('used')}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Expirados: {statusCount('expired')}</span>
        <span className="rounded-full bg-red-50 px-3 py-1">
          Cancelados/reembolsados: {statusCount('cancelled') + statusCount('refunded')}
        </span>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="table-cards cards-issued w-full min-w-[880px] text-sm">
          <thead className="bg-brand-soft">
            <tr className="text-left font-heading text-[0.7rem] uppercase tracking-[0.14em] text-brand-deep">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Titular</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3">Situação</th>
              <th className="px-4 py-3">Emitido</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                </td>
              </tr>
            )}
            {!loading && state.items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  Nenhum ingresso emitido com esses filtros.
                </td>
              </tr>
            )}
            {!loading &&
              state.items.map((ticket) => (
                <tr key={ticket.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">{ticket.code}</td>
                  <td className="px-4 py-3 text-brand-deep">{ticket.holder_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{ticket.event_title}</td>
                  <td className="px-4 py-3 text-slate-600">{ticket.ticket_type_name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge kind="payment" value={ticket.payment_status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge kind="ticket" value={ticket.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(ticket.issued_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setOpenTicket(ticket)} className="rounded-full">
                      QR Code
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {openTicket && <TicketDetail ticket={openTicket} onClose={() => setOpenTicket(null)} />}
    </div>
  );
}