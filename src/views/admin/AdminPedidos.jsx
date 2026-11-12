import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PermissionGate from '@/components/admin/PermissionGate';
import StoreOrderDialog, { StoreOrdersTable } from '@/components/admin/orders/StoreOrderDialog';
import { STORE_ORDER_STATUS, STORE_ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '@/lib/orderStatus';

function Indicator({ label, value, tone = 'default' }) {
  const tones = { default: 'bg-white', warn: 'bg-amber-50', ok: 'bg-emerald-50' };
  return (
    <div className={`rounded-2xl border border-slate-200 p-4 ${tones[tone]}`}>
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 font-heading text-2xl text-brand-deep">{value}</p>
    </div>
  );
}

export default function AdminPedidos() {
  const [filters, setFilters] = useState({ status: '', payment_status: '', search: '' });
  const [state, setState] = useState({ items: [], counts: { status: [], payment: [] } });
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('storeOrderActions', { action: 'list', ...filters });
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
    <PermissionGate permission="pedidos" title="Pedidos da loja">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Pedidos da loja</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Pedidos de uniformes e produtos registrados no site. O estoque é reservado no pedido e devolvido em caso
              de cancelamento. O pagamento só é marcado após a conferência da diretoria.
            </p>
          </div>
          <Button variant="outline" onClick={load} className="rounded-full">
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Indicator label={STORE_ORDER_STATUS.awaiting_contact} value={statusCount('awaiting_contact')} tone="warn" />
          <Indicator label={STORE_ORDER_STATUS.awaiting_payment} value={statusCount('awaiting_payment')} tone="warn" />
          <Indicator label={STORE_ORDER_STATUS.paid} value={statusCount('paid')} tone="ok" />
          <Indicator
            label="Prontos / entregues"
            value={statusCount('ready') + statusCount('delivered')}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Buscar por número do pedido, comprador ou telefone…"
              className="pl-9"
            />
          </div>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">Todas as situações</option>
            {STORE_ORDER_STATUS_OPTIONS.map((option) => (
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

        <div className="mt-5">
          <StoreOrdersTable orders={state.items} loading={loading} onOpen={setOpenId} />
        </div>

        {openId && (
          <StoreOrderDialog orderId={openId} onClose={() => setOpenId('')} onChanged={load} />
        )}
      </div>
    </PermissionGate>
  );
}