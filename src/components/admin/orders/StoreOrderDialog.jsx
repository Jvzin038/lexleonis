import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Ban, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function maskCpf(value) {
  const text = String(value || '');
  // CPF criptografado no banco: o trecho mascarado vem junto (enc:v1:<máscara>:...).
  if (text.startsWith('enc:')) return text.split(':')[2] || '***';
  if (text.includes('*')) return text;
  const digits = text.replace(/\D/g, '');
  if (digits.length === 11) return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
  if (digits.length > 4) return `${'*'.repeat(digits.length - 4)}${digits.slice(-4)}`;
  return digits ? '***' : '';
}
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { STORE_ORDER_STATUS_OPTIONS, whatsappLink } from '@/lib/orderStatus';

export default function StoreOrderDialog({ orderId, onClose, onChanged }) {
  const [state, setState] = useState({ order: null, items: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [confirmAction, setConfirmAction] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('storeOrderActions', { action: 'detail', id: orderId });
      const data = response.data || {};
      setState({ order: data.order || null, items: data.items || [], history: data.history || [] });
      setNote(data.order?.admin_note || '');
      setNextStatus(data.order?.status || 'awaiting_contact');
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
      const response = await base44.functions.invoke('storeOrderActions', { action, id: orderId, ...payload });
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
  const finalStatus = order && ['cancelled', 'refunded'].includes(order.status);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase tracking-tight text-brand-deep">
            Pedido {order?.order_number || ''}
          </DialogTitle>
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
                <p className="text-sm text-slate-600">{order.contact_phone || 'Telefone não informado'}</p>
                {order.contact_phone && (
                  <a
                    href={whatsappLink(
                      order.contact_phone,
                      `Olá, ${order.user_name || ''}! Sobre o seu pedido ${order.order_number} na loja da Atlética Lex Leonis:`,
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
                <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">Resumo</p>
                <p className="mt-1 font-medium text-brand-deep">
                  {order.items_count} item(ns) · {formatCurrency(order.total_amount)}
                </p>
                <p className="text-xs text-slate-500">Solicitado em {formatDateTime(order.created_date)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge kind="order" value={order.status} />
                  <StatusBadge kind="payment" value={order.payment_status} />
                </div>
                {order.confirmed_at && (
                  <p className="mt-3 text-xs text-emerald-700">
                    Pagamento confirmado por {order.confirmed_by_name || order.confirmed_by} em{' '}
                    {formatDateTime(order.confirmed_at)}
                  </p>
                )}
                {order.cancel_reason && <p className="mt-2 text-xs text-red-700">Motivo: {order.cancel_reason}</p>}
              </div>
            </div>

            <div>
              <p className="font-heading text-sm uppercase tracking-[0.14em] text-brand-deep">Itens do pedido</p>
              <ul className="mt-3 space-y-2">
                {state.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  >
                    <span className="text-brand-deep">
                      {item.quantity}x {item.product_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {[
                        item.size && `Tam. ${item.size}`,
                        item.variation,
                        item.custom_number && `Nº ${item.custom_number}`,
                        item.custom_name,
                      ].filter(Boolean).join(' · ') || 'sem variação'}
                    </span>
                    <span className="font-mono text-xs">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">Entrega</p>
              <p className="mt-1 font-medium text-brand-deep">
                {order.fulfillment_method === 'delivery' ? 'Entrega no endereço' : 'Retirada na atlética'}
              </p>
              {order.fulfillment_method === 'delivery' && (
                <div className="mt-2 text-sm text-slate-600">
                  <p>
                    {order.shipping_street}, {order.shipping_number}
                    {order.shipping_complement ? ` — ${order.shipping_complement}` : ''}
                  </p>
                  <p>{order.shipping_neighborhood}</p>
                  <p>
                    {order.shipping_city} — {order.shipping_state}
                    {order.shipping_zip ? ` · CEP ${order.shipping_zip}` : ''}
                  </p>
                </div>
              )}
              {order.buyer_cpf && (
                <p className="mt-2 text-xs text-slate-500">CPF/CNPJ: {maskCpf(order.buyer_cpf)}</p>
              )}
            </div>

            {order.pickup_note && (
              <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                <p className="text-[0.65rem] uppercase tracking-[0.16em]">Observações do comprador</p>
                <p className="mt-1">{order.pickup_note}</p>
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
                Histórico de alterações
              </p>
              <div className="mt-3">
                <HistoryList items={state.history} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-heading text-sm uppercase tracking-[0.14em] text-brand-deep">Operações</p>
              <p className="mt-1 text-xs text-slate-500">
                O pedido nunca é marcado como pago automaticamente. A confirmação registra seu nome, data e hora.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  disabled={busy || finalStatus || order.payment_status === 'confirmed'}
                  onClick={() => setConfirmAction('confirm_payment')}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Confirmar pagamento
                </Button>
                <select
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value)}
                  disabled={finalStatus}
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  {STORE_ORDER_STATUS_OPTIONS.filter(
                    (option) => !['cancelled', 'refunded', 'paid'].includes(option.value),
                  ).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  disabled={busy || finalStatus}
                  onClick={() => run('set_status', { status: nextStatus })}
                  className="rounded-full"
                >
                  Atualizar situação
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || finalStatus}
                  onClick={() => setConfirmAction('cancel')}
                  className="rounded-full border-red-200 text-red-700"
                >
                  <Ban className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || finalStatus}
                  onClick={() => setConfirmAction('refund')}
                  className="rounded-full border-red-200 text-red-700"
                >
                  Reembolsar
                </Button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Cancelamento e reembolso pedem o motivo, que fica registrado no histórico do pedido.
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
                {confirmAction === 'confirm_payment'
                  ? 'Confirmar o pagamento deste pedido?'
                  : confirmAction === 'refund'
                    ? 'Reembolsar este pedido?'
                    : 'Cancelar este pedido?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction === 'confirm_payment'
                  ? 'Confirme apenas depois de verificar o pagamento recebido. O pedido passa para “Pago” e a produção pode ser acompanhada.'
                  : 'O pedido será encerrado e o estoque reservado é devolvido. O histórico é preservado.'}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {(confirmAction === 'cancel' || confirmAction === 'refund') && (
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

            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction
                disabled={(confirmAction === 'cancel' || confirmAction === 'refund') && reason.trim().length < 3}
                onClick={() =>
                  confirmAction === 'confirm_payment'
                    ? run('confirm_payment', { confirmed: true })
                    : run(confirmAction, { reason: reason.trim() })
                }
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

export function StoreOrdersTable({ orders, onOpen, loading }) {
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
        Nenhum pedido encontrado com esses filtros.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="table-cards cards-store-orders w-full min-w-[880px] text-sm">
        <thead className="bg-brand-soft">
          <tr className="text-left font-heading text-[0.7rem] uppercase tracking-[0.14em] text-brand-deep">
            <th className="px-4 py-3">Pedido</th>
            <th className="px-4 py-3">Comprador</th>
            <th className="px-4 py-3">Itens</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Situação</th>
            <th className="px-4 py-3">Pagamento</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-slate-100 align-top">
              <td className="px-4 py-3 font-mono text-xs">{order.order_number || order.id.slice(0, 8).toUpperCase()}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-brand-deep">{order.user_name || '—'}</p>
                <p className="text-xs text-slate-500">{order.contact_phone || order.user_email}</p>
              </td>
              <td className="px-4 py-3 text-slate-600">{order.items_label}</td>
              <td className="px-4 py-3 font-mono">{formatCurrency(order.total_amount)}</td>
              <td className="px-4 py-3">
                <StatusBadge kind="order" value={order.status} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge kind="payment" value={order.payment_status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {order.contact_phone && (
                    <a
                      href={whatsappLink(
                        order.contact_phone,
                        `Olá, ${order.user_name || ''}! Sobre o seu pedido ${order.order_number || ''} na loja da Atlética Lex Leonis:`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      aria-label="Abrir conversa no WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onOpen(order.id)} className="rounded-full">
                    Abrir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
