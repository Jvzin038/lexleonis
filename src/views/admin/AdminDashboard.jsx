import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router-compat';
import { AlertTriangle, CalendarDays, CheckCircle2, ShoppingBag, Ticket, TrendingUp, Wallet } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { base44 } from '@/api/base44Client';
import { formatCurrency, formatDate } from '@/lib/format';

const PERIODS = [
  { key: 30, label: 'Últimos 30 dias' },
  { key: 90, label: 'Últimos 90 dias' },
  { key: 365, label: 'Últimos 12 meses' },
];

function MetricCard({ icon: Icon, label, value, hint, tone = 'default' }) {
  const tones = {
    default: 'border-slate-200 bg-white',
    gold: 'border-brand-gold/50 bg-brand-gold/10',
    alert: 'border-amber-200 bg-amber-50',
  };
  return (
    <div className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</span>
        <Icon className="h-4 w-4 text-brand-primary" />
      </div>
      <p className="mt-3 font-heading text-2xl tracking-tight text-brand-deep">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState(90);
  const [metrics, setMetrics] = useState(null);
  const [chart, setChart] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [lists, setLists] = useState({ matches: [], posts: [], lowStock: [], logs: [] });
  const [boardError, setBoardError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const [board, matches, posts, products, logs] = await Promise.allSettled([
        base44.functions.invoke('staffData', { action: 'dashboard', period }),
        base44.entities.Match.filter({ status: 'scheduled' }, { sort: 'match_date', limit: 5 }),
        base44.entities.Post.filter({}, { sort: '-created_date', limit: 5 }),
        base44.entities.Product.filter({ status: 'published' }, { limit: 100 }),
        base44.entities.AdminLog.filter({}, { sort: '-created_date', limit: 8 }),
      ]);

      if (!active) return;

      const data = board.status === 'fulfilled' ? board.value?.data || {} : {};
      setBoardError(
        board.status === 'fulfilled' && data.counts
          ? ''
          : 'Não foi possível carregar os indicadores agora. Atualize a página ou verifique suas permissões.',
      );

      const productsList = products.status === 'fulfilled' ? products.value?.items || [] : [];
      const lowStock = productsList
        .filter((product) => !product.preorder && Number(product.stock || 0) <= Number(product.low_stock_alert ?? 5))
        .slice(0, 6);

      setMetrics({
        events: data.counts?.events || 0,
        upcoming: data.counts?.upcoming || 0,
        registrations: data.counts?.registrations || 0,
        tickets: data.counts?.tickets || 0,
        confirmedRevenue: data.confirmedRevenue || 0,
        orderRevenue: data.orderRevenue || 0,
        ordersCount: data.ordersCount || 0,
      });

      setChart(data.chart || []);
      setTopEvents(data.topEvents || []);

      setLists({
        matches: matches.status === 'fulfilled' ? matches.value?.items || [] : [],
        posts: posts.status === 'fulfilled' ? posts.value?.items || [] : [],
        lowStock,
        logs: logs.status === 'fulfilled' ? logs.value?.items || [] : [],
      });
    })();
    return () => {
      active = false;
    };
  }, [period]);

  const hasChartData = useMemo(() => chart.some((row) => row.valor > 0), [chart]);

  if (!metrics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Visão geral</h2>
          <p className="mt-1 text-sm text-slate-500">
            Indicadores calculados a partir dos dados registrados no sistema.
          </p>
          {boardError && (
            <p className="mt-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{boardError}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPeriod(item.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                period === item.key ? 'bg-brand-deep text-white' : 'bg-white text-brand-deep'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={CalendarDays} label="Total de eventos" value={metrics.events} hint={`${metrics.upcoming} próximos`} />
        <MetricCard icon={CheckCircle2} label="Inscrições confirmadas" value={metrics.registrations} />
        <MetricCard icon={Ticket} label="Ingressos emitidos" value={metrics.tickets} />
        <MetricCard
          icon={Wallet}
          label="Receita confirmada"
          value={formatCurrency(metrics.confirmedRevenue)}
          hint="Somente inscrições com pagamento confirmado"
          tone="gold"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={ShoppingBag}
          label="Total de pedidos da loja"
          value={metrics.ordersCount}
          hint={formatCurrency(metrics.orderRevenue)}
        />
        <MetricCard
          icon={TrendingUp}
          label="Próximas partidas"
          value={lists.matches.length}
          hint={lists.matches[0] ? `Próxima em ${formatDate(lists.matches[0].match_date)}` : 'Sem jogos agendados'}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Produtos com estoque baixo"
          value={lists.lowStock.length}
          tone={lists.lowStock.length > 0 ? 'alert' : 'default'}
        />
        <MetricCard icon={CalendarDays} label="Publicações recentes" value={lists.posts.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">
            Vendas confirmadas por período
          </h3>
          <div className="mt-6 h-64">
            {hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="valor" fill="var(--brand-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-center text-sm text-slate-400">
                Ainda não há pagamentos confirmados no período selecionado. O gráfico é preenchido automaticamente
                conforme a diretoria confirma os pagamentos.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">
            Eventos com maior participação
          </h3>
          <div className="mt-6">
            {topEvents.length === 0 ? (
              <p className="text-sm text-slate-400">
                Nenhuma inscrição registrada ainda. A lista aparece quando houver inscrições nos eventos.
              </p>
            ) : (
              <ul className="space-y-4">
                {topEvents.map((row) => (
                  <li key={row.event_title || 'sem-evento'} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-600">{row.event_title || 'Evento sem título'}</span>
                    <span className="font-mono text-sm text-brand-deep">{row.sum_quantity || 0} inscrições</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">Próximas partidas</h3>
          <div className="mt-5 space-y-3">
            {lists.matches.length === 0 && <p className="text-sm text-slate-400">Nenhuma partida agendada.</p>}
            {lists.matches.map((match) => (
              <div key={match.id} className="rounded-xl bg-brand-soft p-3">
                <p className="font-mono text-xs text-brand-primary">{formatDate(match.match_date)}</p>
                <p className="mt-1 text-sm text-brand-deep">
                  {match.sport_name || 'Jogo'} × {match.opponent}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">Estoque baixo</h3>
          <div className="mt-5 space-y-3">
            {lists.lowStock.length === 0 && <p className="text-sm text-slate-400">Todos os produtos com estoque.</p>}
            {lists.lowStock.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-xl bg-amber-50 p-3 text-sm">
                <span className="text-brand-deep">{product.name}</span>
                <span className="font-mono">{Number(product.stock || 0)} un.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">
            Atividades recentes da administração
          </h3>
          <div className="mt-5 space-y-3">
            {lists.logs.length === 0 && (
              <p className="text-sm text-slate-400">
                As ações administrativas importantes são registradas aqui automaticamente.
              </p>
            )}
            {lists.logs.map((log) => (
              <div key={log.id} className="rounded-xl bg-brand-soft p-3">
                <p className="text-sm text-brand-deep">{log.action}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {log.user_name || log.user_email} • {formatDate(log.created_date)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">Publicações recentes</h3>
        <div className="mt-5 space-y-3">
          {lists.posts.length === 0 && <p className="text-sm text-slate-400">Nenhuma publicação criada ainda.</p>}
          {lists.posts.map((post) => (
            <Link
              key={post.id}
              to="/painel/noticias"
              className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm hover:border-brand-primary/40"
            >
              <span className="text-brand-deep">{post.title}</span>
              <span className="font-mono text-xs text-slate-400">{formatDate(post.created_date)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}