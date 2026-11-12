import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Download, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { formatCurrency, toCsv, downloadTextFile } from '@/lib/format';

const STATUS_LABELS = {
  confirmed: 'Pagamento confirmado',
  pending: 'Pagamento pendente',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  not_required: 'Sem cobrança',
};

function SumCard({ label, value, hint, tone = 'default' }) {
  const tones = {
    default: 'border-slate-200 bg-white',
    positive: 'border-emerald-200 bg-emerald-50',
    alert: 'border-amber-200 bg-amber-50',
  };
  return (
    <div className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-3 font-heading text-xl tracking-tight text-brand-deep">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function AdminFinanceiro() {
  const [registrationRows, setRegistrationRows] = useState([]);
  const [orderRows, setOrderRows] = useState([]);
  const [byEvent, setByEvent] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [board] = await Promise.allSettled([base44.functions.invoke('staffData', { action: 'finance' })]);
      if (!active) return;
      const data = board.status === 'fulfilled' ? board.value?.data || {} : {};
      setRegistrationRows(data.registrationRows || []);
      setOrderRows(data.orderRows || []);
      setByEvent(data.byEvent || []);
      setRegistrations(data.registrations || []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    const find = (rows, status) => rows.find((row) => row.payment_status === status) || {};
    const confirmed = find(registrationRows, 'confirmed');
    const pending = find(registrationRows, 'pending');
    const refunded = find(registrationRows, 'refunded');
    const cancelled = find(registrationRows, 'cancelled');
    const ordersConfirmed = find(orderRows, 'confirmed');
    const ordersPending = find(orderRows, 'pending');
    return {
      confirmed: Number(confirmed.sum_total_amount || 0),
      confirmedCount: Number(confirmed.count || 0),
      pending: Number(pending.sum_total_amount || 0),
      pendingCount: Number(pending.count || 0),
      refunded: Number(refunded.sum_total_amount || 0),
      cancelled: Number(cancelled.sum_total_amount || 0) + Number(cancelled.count || 0) * 0,
      ordersConfirmed: Number(ordersConfirmed.sum_total_amount || 0),
      ordersPending: Number(ordersPending.sum_total_amount || 0),
    };
  }, [registrationRows, orderRows]);

  const exportCsv = () => {
    const csv = toCsv(registrations, [
      { label: 'Evento', value: (row) => row.event_title },
      { label: 'Aluno', value: (row) => row.user_name },
      { label: 'Situação', value: (row) => row.status },
      { label: 'Pagamento', value: (row) => STATUS_LABELS[row.payment_status] || row.payment_status },
      { label: 'Valor', value: (row) => row.total_amount },
      { label: 'Código', value: (row) => row.code },
    ]);
    downloadTextFile('relatorio-inscricoes.csv', csv, 'text/csv;charset=utf-8');
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Relatórios financeiros</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Valores calculados a partir das inscrições e pedidos registrados. Receita confirmada é diferente de
            faturamento previsto — nunca misture os dois.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} className="rounded-full border-brand-deep text-brand-deep">
          <Download className="mr-2 h-4 w-4" /> Exportar inscrições
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SumCard
          label="Valor bruto confirmado"
          value={formatCurrency(totals.confirmed)}
          hint={`${totals.confirmedCount} inscrição(ões) com pagamento confirmado`}
          tone="positive"
        />
        <SumCard
          label="Pagamentos pendentes"
          value={formatCurrency(totals.pending)}
          hint={`${totals.pendingCount} inscrição(ões) aguardando validação`}
          tone="alert"
        />
        <SumCard label="Reembolsos e cancelamentos" value={formatCurrency(totals.refunded)} />
        <SumCard
          label="Pedidos da loja confirmados"
          value={formatCurrency(totals.ordersConfirmed)}
          hint={`Pendentes: ${formatCurrency(totals.ordersPending)}`}
        />
      </div>

      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Sobre taxas e valor líquido</p>
          <p className="mt-1">
            Não há provedor de pagamento integrado, portanto nenhuma taxa é descontada automaticamente. O valor líquido
            estimado é igual ao valor bruto confirmado. Quando a cobrança online for conectada, as taxas do provedor
            passarão a ser registradas separadamente.
          </p>
        </div>
      </div>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="table-cards cards-fin-status w-full min-w-[640px] text-sm">
          <thead className="bg-brand-soft">
            <tr className="text-left font-heading text-[0.7rem] uppercase tracking-[0.14em] text-brand-deep">
              <th className="px-4 py-3">Situação do pagamento</th>
              <th className="px-4 py-3">Inscrições</th>
              <th className="px-4 py-3">Ingressos</th>
              <th className="px-4 py-3">Valor</th>
            </tr>
          </thead>
          <tbody>
            {registrationRows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  Nenhuma inscrição registrada ainda.
                </td>
              </tr>
            )}
            {registrationRows.map((row) => (
              <tr key={row.payment_status} className="border-t border-slate-100">
                <td className="px-4 py-3 text-brand-deep">
                  {STATUS_LABELS[row.payment_status] || row.payment_status}
                </td>
                <td className="px-4 py-3 font-mono">{row.count}</td>
                <td className="px-4 py-3 font-mono">{row.sum_quantity || 0}</td>
                <td className="px-4 py-3 font-mono">{formatCurrency(row.sum_total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <Info className="h-4 w-4 text-brand-primary" />
          <h3 className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">
            Receita confirmada por evento
          </h3>
        </div>
        <table className="table-cards cards-fin-event w-full min-w-[560px] text-sm">
          <thead className="bg-brand-soft">
            <tr className="text-left font-heading text-[0.7rem] uppercase tracking-[0.14em] text-brand-deep">
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Ingressos confirmados</th>
              <th className="px-4 py-3">Valor confirmado</th>
            </tr>
          </thead>
          <tbody>
            {byEvent.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                  Nenhum pagamento confirmado até o momento.
                </td>
              </tr>
            )}
            {byEvent.map((row) => (
              <tr key={row.event_title || 'sem-evento'} className="border-t border-slate-100">
                <td className="px-4 py-3 text-brand-deep">{row.event_title || 'Evento sem título'}</td>
                <td className="px-4 py-3 font-mono">{row.sum_quantity || 0}</td>
                <td className="px-4 py-3 font-mono">{formatCurrency(row.sum_total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}