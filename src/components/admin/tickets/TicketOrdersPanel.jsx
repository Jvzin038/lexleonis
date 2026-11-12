import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, MessageCircle, RefreshCw, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/site/StatusBadge';
import TicketOrderDialog from '@/components/admin/tickets/TicketOrderDialog';
import { formatCurrency, formatDate } from '@/lib/format';
import { EMISSION_STATUS, TICKET_ORDER_STATUS_OPTIONS, whatsappLink } from '@/lib/orderStatus';

function Indicator({ label, value, tone = 'default' }) {
  const styles = {
    default: 'bg-white text-brand-deep',
    warn: 'bg-amber-50 text-amber-900',
    ok: 'bg-emerald-50 text-emerald-800',
  };
  return (
    <div className={`rounded-2xl border border-slate-200 p-4 ${styles[tone]}`}>
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 font-heading text-2xl">{value}</p>
    </div>
  );
}

export default function TicketOrdersPanel({ events, onChanged }) {
  const [filters, setFilters] = useState({ event_id: '', status: '', search: '' });
  const [state, setState] = useState({ items: [], counts: { status: [], payment: [] } });
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('ticketOrderActions', { action: 'list', ...filters });
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
          <h3 className="font-heading text-base uppercase tracking-tight text-brand-deep">Ingressos e pedidos</h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Pedidos registrados no site aguardam contato e conferência. Somente após a confirmação do pagamento os
            ingressos são emitidos com QR Code.
          </p>
        </div>
        <Button variant="outline" onClick={load} className="rounded-full">
          <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Indicator label="Aguardando contato" value={statusCount('pending')} tone="warn" />
        <Indicator label="Aguardando pagamento" value={statusCount('awaiting_payment')} tone="warn" />
        <Indicator label="Pagos" value={statusCount('confirmed')} tone="ok" />
        <Indicator label="Cancelados / reembolsados" value={statusCount('cancelled') + statusCount('refunded')} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Buscar por número do pedido, comprador, telefone ou e-mail…"
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
          <option value="">Todos os status</option>
          {TICKET_ORDER_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="table-cards cards-ticket-orders w-full min-w-[900px] text-sm">
          <thead className="bg-brand-soft">
            <tr className="text-left font-heading text-[0.7rem] uppercase tracking-[0.14em] text-brand-deep">
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Comprador</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Qtd</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Emissão</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                </td>
              </tr>
            )}
            {!loading && state.items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                  Nenhum pedido encontrado com esses filtros.
                </td>
              </tr>
            )}
            {!loading &&
              state.items.map((order) => (
                <tr key={order.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3 font-mono text-xs">{order.order_number || order.code}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-deep">{order.user_name || '—'}</p>
                    <p className="text-xs text-slate-500">{order.user_phone || order.user_email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{order.event_title}</td>
                  <td className="px-4 py-3">{order.quantity}</td>
                  <td className="px-4 py-3 font-mono">{formatCurrency(order.total_amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge kind="registration" value={order.status} />
                      <StatusBadge kind="payment" value={order.payment_status} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {EMISSION_STATUS[order.emission_status || 'not_issued']}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(order.created_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {order.user_phone && (
                        <a
                          href={whatsappLink(
                            order.user_phone,
                            `Olá, ${order.user_name || ''}! Sobre o seu pedido ${order.order_number || ''} da Atlética Lex Leonis:`,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          aria-label="Abrir conversa no WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenId(order.id)}
                        className="rounded-full"
                      >
                        Abrir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {openId && (
        <TicketOrderDialog
          orderId={openId}
          onClose={() => setOpenId('')}
          onChanged={() => {
            load();
            onChanged?.();
          }}
        />
      )}
    </div>
  );
}