import React, { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import PageHero from '@/components/site/PageHero';
import EventCard from '@/components/site/EventCard';
import EmptyState from '@/components/site/EmptyState';
import useCollection from '@/hooks/useCollection';
import usePageMeta from '@/hooks/usePageMeta';
import { todayIso } from '@/lib/format';

const PERIODS = [
  { key: 'upcoming', label: 'Próximos' },
  { key: 'past', label: 'Já realizados' },
  { key: 'all', label: 'Todos' },
];

const STATUSES = [
  { key: 'all', label: 'Todos os status' },
  { key: 'published', label: 'Publicados' },
  { key: 'sold_out', label: 'Esgotados' },
  { key: 'cancelled', label: 'Cancelados' },
  { key: 'finished', label: 'Encerrados' },
];

export default function Eventos() {
  const [category, setCategory] = useState('all');
  const [period, setPeriod] = useState('upcoming');
  const [status, setStatus] = useState('all');

  usePageMeta('Eventos', 'Todos os eventos, festas, jogos e ações da Atlética Lex Leonis.');

  const query = useMemo(() => {
    const today = todayIso();
    const base = { status: status === 'all' ? { $ne: 'draft' } : status };
    if (category !== 'all') base.category = category;
    if (period === 'upcoming') base.start_date = { $gte: today };
    if (period === 'past') base.start_date = { $lt: today };
    return base;
  }, [category, period, status]);

  const { items, loading } = useCollection('Event', query, { sort: 'start_date', limit: 80 });
  const { items: categories } = useCollection('EventCategory', { active: true }, { sort: 'order', limit: 50 });

  return (
    <div>
      <PageHero
        eyebrow="Agenda da atlética"
        title="Eventos"
        subtitle="Festas, recepção de calouros, jogos universitários, torneios, ações sociais e eventos acadêmicos da Lex Leonis."
      />

      <section className="site-container py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
            <Filter className="h-4 w-4" /> Filtrar eventos
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div>
              <label htmlFor="filtro-categoria" className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                Categoria
              </label>
              <select
                id="filtro-categoria"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-brand-deep"
              >
                <option value="all">Todas as categorias</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Período</span>
              <div className="mt-2 flex gap-2">
                {PERIODS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPeriod(item.key)}
                    className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      period === item.key ? 'bg-brand-deep text-white' : 'bg-brand-soft text-brand-deep'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="filtro-status" className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                Status
              </label>
              <select
                id="filtro-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-brand-deep"
              >
                {STATUSES.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-10">
          {loading && <p className="text-sm text-slate-500">Carregando eventos…</p>}

          {!loading && items.length === 0 && (
            <EmptyState
              title="Nenhum evento encontrado"
              message="Ajuste os filtros ou confira novamente em breve — novos eventos são publicados pela diretoria."
            />
          )}

          {!loading && items.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}