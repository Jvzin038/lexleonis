import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, Loader2, Search, Ticket, Trash2, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StatusBadge from '@/components/site/StatusBadge';
import { formatCurrency, formatDate, toCsv, downloadTextFile } from '@/lib/format';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todas as situações' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'waitlist', label: 'Lista de espera' },
  { value: 'cancelled', label: 'Canceladas' },
];

export default function AdminInscricoes() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState('');
  const [feedback, setFeedback] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('ticketOrderActions', {
        action: 'list',
        event_id: eventId === 'all' ? '' : eventId,
        status: status === 'all' ? '' : status,
        search,
      });
      setRegistrations(response.data?.items || []);
    } catch (error) {
      setRegistrations([]);
      setFeedback(error?.response?.data?.error || 'Não foi possível carregar as inscrições.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const page = await base44.entities.Event.filter({}, { sort: '-start_date', limit: 200 });
      setEvents(page?.items || []);
    })();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, status, search]);

  const confirmPayment = async (registration) => {
    setBusyId(registration.id);
    setFeedback('');
    try {
      const response = await base44.functions.invoke('ticketOrderActions', {
        action: 'confirm',
        id: registration.id,
        confirmed: true,
      });
      const issued = response?.data?.tickets?.length || 0;
      await load();
      setFeedback(
        response?.data?.already
          ? 'Este pagamento já estava confirmado e os ingressos emitidos.'
          : `Pagamento confirmado e ${issued} ingresso(s) emitido(s).`,
      );
    } catch (error) {
      setFeedback(error?.response?.data?.error || 'Não foi possível confirmar o pagamento agora.');
    } finally {
      setBusyId('');
    }
  };

  const deleteRegistration = async (registration) => {
    if (!window.confirm(`Excluir a inscrição de ${registration.user_name || 'participante'}?\nEsta ação remove o registro e os ingressos emitidos. Não pode ser desfeita.`)) return;
    setBusyId(registration.id);
    setFeedback('');
    try {
      await base44.functions.invoke('ticketOrderActions', { action: 'delete', id: registration.id });
      await load();
      setFeedback('Inscrição excluída permanentemente.');
    } catch (error) {
      setFeedback(error?.response?.data?.error || 'Não foi possível excluir a inscrição.');
    } finally {
      setBusyId('');
    }
  };

  const cancelRegistration = async (registration) => {
    setBusyId(registration.id);
    setFeedback('');
    try {
      await base44.functions.invoke('ticketOrderActions', {
        action: 'cancel',
        id: registration.id,
        reason: 'Cancelada pela diretoria no painel de inscrições',
      });
      await load();
      setFeedback('Inscrição cancelada.');
    } catch (error) {
      setFeedback(error?.response?.data?.error || 'Não foi possível cancelar a inscrição.');
    } finally {
      setBusyId('');
    }
  };

  const exportCsv = () => {
    const csv = toCsv(registrations, [
      { label: 'Evento', value: (row) => row.event_title },
      { label: 'Participante', value: (row) => row.user_name },
      { label: 'E-mail', value: (row) => row.user_email },
      { label: 'Telefone', value: (row) => row.user_phone },
      { label: 'Lote', value: (row) => row.ticket_type_name },
      { label: 'Quantidade', value: (row) => row.quantity },
      { label: 'Total', value: (row) => row.total_amount },
      { label: 'Situação', value: (row) => row.status },
      { label: 'Pagamento', value: (row) => row.payment_status },
      { label: 'Código', value: (row) => row.code },
      { label: 'Registrada em', value: (row) => formatDate(row.created_date) },
    ]);
    downloadTextFile('inscricoes-lex-leonis.csv', csv, 'text/csv;charset=utf-8');
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Inscrições e participantes</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Confirme o pagamento somente após receber a validação real. A confirmação emite automaticamente o ingresso
            digital com código único.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} className="rounded-full border-brand-deep text-brand-deep">
          <Download className="mr-2 h-4 w-4" /> Exportar lista
        </Button>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-3">
        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Evento</Label>
          <select
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="all">Todos os eventos</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Situação</Label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Buscar participante</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome, e-mail ou código"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {feedback && (
        <p className="mt-4 rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand-deep">{feedback}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="table-cards cards-inscricoes w-full min-w-[900px] text-sm">
          <thead className="bg-brand-soft">
            <tr className="text-left font-heading text-[0.7rem] uppercase tracking-[0.14em] text-brand-deep">
              <th className="px-4 py-3">Participante</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Lote</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Situação</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {!loading && registrations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Nenhuma inscrição encontrada com os filtros atuais.
                </td>
              </tr>
            )}
            {!loading &&
              registrations.map((registration) => (
                <tr key={registration.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-deep">{registration.user_name || '—'}</p>
                    <p className="text-xs text-slate-500">{registration.user_email}</p>
                    {registration.user_phone && <p className="text-xs text-slate-400">{registration.user_phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{registration.event_title || '—'}</p>
                    <p className="font-mono text-xs text-slate-400">{registration.code}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {registration.ticket_type_name}
                    <span className="ml-1 font-mono text-xs text-slate-400">×{registration.quantity}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">{formatCurrency(registration.total_amount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge kind="registration" value={registration.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge kind="payment" value={registration.payment_status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      {registration.payment_status !== 'confirmed' && registration.status !== 'cancelled' && (
                        <button
                          type="button"
                          disabled={busyId === registration.id}
                          onClick={() => confirmPayment(registration)}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar pagamento
                        </button>
                      )}
                      {registration.ticket_issued && (
                        <button
                          type="button"
                          disabled={busyId === registration.id}
                          onClick={async () => {
                            setBusyId(registration.id);
                            try {
                              await base44.functions.invoke('issueTickets', { registration_id: registration.id });
                              setFeedback('Ingressos verificados.');
                            } finally {
                              setBusyId('');
                            }
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-deep"
                        >
                          <Ticket className="h-3.5 w-3.5" /> Ver ingressos
                        </button>
                      )}
                      {registration.status !== 'cancelled' && (
                        <button
                          type="button"
                          disabled={busyId === registration.id}
                          onClick={() => cancelRegistration(registration)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-red-700 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancelar
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busyId === registration.id}
                        onClick={() => deleteRegistration(registration)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}