import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Ban, CheckCircle2, Loader2, MessageCircle, RotateCcw, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import StatusBadge from '@/components/site/StatusBadge';
import HistoryList from '@/components/admin/HistoryList';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { EMISSION_STATUS, TICKET_STATE, whatsappLink } from '@/lib/orderStatus';

export default function TicketOrderDialog({ orderId, onClose, onChanged }) {
  const [state, setState] = useState({ order: null, tickets: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [confirmAction, setConfirmAction] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('ticketOrderActions', { action: 'detail', id: orderId });
      const data = response.data || {};
      setState({
        order: data.order || null,
        tickets: data.tickets || [],
        history: data.history || [],
      });
      setNote(data.order?.admin_note || '');
    } catch (loadError) {
      setError('Não foi possível carregar o pedido.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (action, payload = {}) => {
    setBusy(true);
    setError('');
    try {
      const response = await base44.functions.invoke('ticketOrderActions', { action, id: orderId, ...payload });
      if (action === 'delete' && !response.data?.error) {
        onChanged?.();
        onClose();
        return;
      }
      if (response.data?.error) setError(response.data.error);
      await load();
      onChanged?.();
    } catch (runError) {
      setError(runError?.response?.data?.error || 'Não foi possível concluir a operação.');
    } finally {
      setBusy(false);
      setConfirmAction('');
    }
  };

  const order = state.order;
  const requiresReason = confirmAction === 'cancel' || confirmAction === 'refund';

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase tracking-tight text-brand-deep">
            Pedido {order?.order_number || ''}
          </DialogTitle>
          <DialogDescription>
            Confira os dados, registre o contato e confirme o pagamento para emitir os ingressos.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}

        {!loading && order && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-brand-soft p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">Comprador</p>
                <p className="mt-1 font-medium text-brand-deep">{order.user_name || '—'}</p>
                <p className="text-sm text-slate-600">{order.user_email}</p>
                <p className="text-sm text-slate-600">{order.user_phone || 'Telefone não informado'}</p>
                {order.user_phone && (
                  <a
                    href={whatsappLink(
                      order.user_phone,
                      `Olá, ${order.user_name || ''}! Sobre o seu pedido ${order.order_number} da Atlética Lex Leonis:`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Falar no WhatsApp
                  </a>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">Pedido</p>
                <p className="mt-1 font-medium text-brand-deep">{order.event_title}</p>
                <p className="text-sm text-slate-600">
                  {order.quantity}x {order.ticket_type_name}
                </p>
                <p className="text-sm text-slate-600">
                  {formatCurrency(order.unit_price)} por ingresso · total{' '}
                  <span className="font-mono font-semibold">{formatCurrency(order.total_amount)}</span>
                </p>
                <p className="text-xs text-slate-500">Solicitado em {formatDateTime(order.created_date)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge kind="registration" value={order.status} />
                  <StatusBadge kind="payment" value={order.payment_status} />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-600">
                    {EMISSION_STATUS[order.emission_status || 'not_issued']}
                  </span>
                </div>
                {order.confirmed_at && (
                  <p className="mt-3 text-xs text-emerald-700">
                    Pagamento confirmado por {order.confirmed_by_name || order.confirmed_by} em{' '}
                    {formatDateTime(order.confirmed_at)}
                  </p>
                )}
                {order.cancel_reason && (
                  <p className="mt-2 text-xs text-red-700">Motivo: {order.cancel_reason}</p>
                )}
              </div>
            </div>

            {order.notes && (
              <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                <p className="text-[0.65rem] uppercase tracking-[0.16em]">Observações do comprador</p>
                <p className="mt-1">{order.notes}</p>
              </div>
            )}

            <div>
              <p className="font-heading text-sm uppercase tracking-[0.14em] text-brand-deep">Observação interna</p>
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} className="mt-2" />
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => run('note', { admin_note: note })}
                className="mt-2 rounded-full"
              >
                Salvar observação
              </Button>
            </div>

            <div>
              <p className="font-heading text-sm uppercase tracking-[0.14em] text-brand-deep">
                Ingressos emitidos ({state.tickets.length})
              </p>
              {state.tickets.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  Nenhum ingresso emitido ainda. A emissão acontece na confirmação do pagamento.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {state.tickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    >
                      <span className="font-mono text-xs">{ticket.code}</span>
                      <span className="text-slate-600">{ticket.holder_name}</span>
                      <span className="text-xs text-slate-500">
                        {TICKET_STATE[ticket.status] || ticket.status}
                        {ticket.checked_in_at ? ` · entrada ${formatDateTime(ticket.checked_in_at)}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="font-heading text-sm uppercase tracking-[0.14em] text-brand-deep">
                Histórico de alterações
              </p>
              <div className="mt-3">
                <HistoryList items={state.history} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-heading text-sm uppercase tracking-[0.14em] text-brand-deep">Operações</p>
              <p className="mt-1 text-xs text-slate-500">
                A confirmação do pagamento exige conferência do valor recebido e fica registrada com seu nome, data e
                hora. A emissão é automática e nunca duplica ingressos.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  disabled={busy || order.status !== 'pending'}
                  onClick={() => run('contacted')}
                  className="rounded-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Registrar contato
                </Button>
                <Button
                  disabled={busy || order.payment_status === 'confirmed'}
                  onClick={() => setConfirmAction('confirm')}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Confirmar pagamento e emitir
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setConfirmAction('cancel')}
                  className="rounded-full border-red-200 text-red-700"
                >
                  <Ban className="mr-2 h-4 w-4" /> Cancelar pedido
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setConfirmAction('delete')}
                  className="rounded-full border-red-200 bg-red-50 text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir pedido
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setConfirmAction('refund')}
                  className="rounded-full border-red-200 text-red-700"
                >
                  Reembolsar
                </Button>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Cancelamento e reembolso pedem a justificativa, que fica registrada no histórico do pedido. Para apagar o
                comprador da lista, use “Excluir pedido”.
              </p>
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
                <AlertTriangle className="h-4 w-4" /> {error}
              </p>
            )}
          </div>
        )}

        <AlertDialog open={Boolean(confirmAction)} onOpenChange={(open) => !open && setConfirmAction('')}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction === 'confirm'
                  ? 'Confirmar o pagamento deste pedido?'
                  : confirmAction === 'refund'
                    ? 'Reembolsar este pedido?'
                    : confirmAction === 'delete'
                      ? 'Excluir este pedido e os ingressos?'
                      : 'Cancelar este pedido?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction === 'confirm'
                  ? 'Confirme apenas depois de verificar o pagamento recebido. Os ingressos serão emitidos com QR Code e liberados na área do aluno. A operação fica registrada com seu nome.'
                  : confirmAction === 'delete'
                    ? 'A inscrição, os ingressos emitidos e o histórico deste pedido serão apagados do sistema. Não é possível desfazer.'
                    : 'Os ingressos deste pedido deixam de funcionar na portaria e o histórico é preservado. Esta ação é registrada com seu nome.'}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {requiresReason && (
              <div className="mt-4">
                <Textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  placeholder="Justificativa do cancelamento ou reembolso (obrigatória)"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Escreva o motivo (mínimo de 3 caracteres) para liberar a confirmação.
                </p>
              </div>
            )}

            {confirmAction === 'delete' && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
                O comprador sai da lista de participantes e os ingressos emitidos para ele param de funcionar.
              </p>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction
                disabled={requiresReason && reason.trim().length < 3}
                onClick={() =>
                  confirmAction === 'confirm'
                    ? run('confirm', { confirmed: true })
                    : confirmAction === 'delete'
                      ? run('delete')
                      : run(confirmAction, { reason: reason.trim() })
                }
              >
                {confirmAction === 'delete' ? 'Excluir' : 'Confirmar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}