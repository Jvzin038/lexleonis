import React from 'react';
import StatusBadge from '@/components/site/StatusBadge';
import EmptyState from '@/components/site/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';

export default function StudentOrders({ orders, itemsByOrder }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="Nenhum pedido registrado"
        message="Os pedidos feitos na loja oficial aparecem aqui com o status de pagamento e retirada."
        actionLabel="Ir para a loja"
        actionTo="/loja"
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-semibold text-brand-deep">
                Pedido {order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="mt-1 text-xs text-slate-500">Registrado em {formatDate(order.created_date)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge kind="order" value={order.status} />
              <StatusBadge kind="payment" value={order.payment_status} />
            </div>
          </div>

          <ul className="mt-4 space-y-1 text-sm text-slate-600">
            {(itemsByOrder[order.id] || []).map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span>
                  {item.quantity}x {item.product_name}
                  {item.size ? ` (${item.size})` : ''}
                </span>
                <span className="font-mono">{formatCurrency(item.unit_price * item.quantity)}</span>
              </li>
            ))}
            {(!itemsByOrder[order.id] || itemsByOrder[order.id].length === 0) && order.items_label && (
              <li className="text-slate-500">{order.items_label}</li>
            )}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Total</span>
            <span className="font-mono text-base font-semibold text-brand-deep">
              {formatCurrency(order.total_amount)}
            </span>
          </div>

          {order.pickup_note && <p className="mt-3 text-xs text-slate-500">Observações: {order.pickup_note}</p>}
        </div>
      ))}
    </div>
  );
}