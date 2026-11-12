import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Download, List, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from './EmptyState';
import { buildIcs } from '@/lib/ics';
import { downloadTextFile, formatDate, formatTime, MONTHS, MONTHS_SHORT, WEEKDAYS_SHORT } from '@/lib/format';

const VIEWS = [
  { key: 'month', label: 'Mês', icon: CalendarDays },
  { key: 'week', label: 'Semana', icon: CalendarDays },
  { key: 'list', label: 'Lista', icon: List },
];

function dateKey(value) {
  return String(value || '').slice(0, 10);
}

function startOfWeek(date) {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function CalendarBoard({ activities = [], categories = [], loading = false }) {
  const [view, setView] = useState('month');
  const [cursor, setCursor] = useState(() => new Date());
  const [category, setCategory] = useState('all');
  const [selectedDay, setSelectedDay] = useState(null);

  const filtered = useMemo(
    () => activities.filter((item) => category === 'all' || item.category === category),
    [activities, category],
  );

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((item) => {
      const key = dateKey(item.date);
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    map.forEach((list) => list.sort((a, b) => String(a.time || '').localeCompare(String(b.time || ''))));
    return map;
  }, [filtered]);

  const monthCells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells = Array.from({ length: first.getDay() }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [cursor]);

  const sortedList = useMemo(() => {
    return filtered
      .filter((item) => dateKey(item.date))
      .slice()
      .sort((a, b) => `${a.date}${a.time || ''}`.localeCompare(`${b.date}${b.time || ''}`));
  }, [filtered]);

  const exportAll = () => {
    const ics = buildIcs(
      filtered.map((item) => ({
        uid: item.uid,
        title: item.title,
        date: item.date,
        time: item.time,
        description: item.description,
        location: item.location,
        url: item.url,
      })),
    );
    downloadTextFile('agenda-lex-leonis.ics', ics, 'text/calendar;charset=utf-8');
  };

  const exportOne = (activity) => {
    const ics = buildIcs([
      {
        uid: activity.uid,
        title: activity.title,
        date: activity.date,
        time: activity.time,
        description: activity.description,
        location: activity.location,
        url: activity.url,
      },
    ]);
    downloadTextFile(`lex-leonis-${dateKey(activity.date)}.ics`, ics, 'text/calendar;charset=utf-8');
  };

  const todayKey = dateKey(new Date().toISOString());

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {VIEWS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setView(item.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                view === item.key ? 'bg-brand-deep text-white' : 'bg-brand-soft text-brand-deep hover:bg-brand-primary/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-brand-deep sm:h-10 sm:w-auto"
            aria-label="Filtrar por categoria"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={exportAll} className="h-11 w-full rounded-lg border-brand-deep text-brand-deep sm:h-10 sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Exportar agenda
          </Button>
        </div>
      </div>

      {view !== 'list' && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setCursor(
                view === 'month'
                  ? new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
                  : new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 7),
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-brand-deep hover:bg-brand-soft"
            aria-label="Período anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="font-heading text-sm uppercase tracking-[0.18em] text-brand-deep">
            {view === 'month'
              ? `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`
              : `${formatDate(weekDays[0])} — ${formatDate(weekDays[6])}`}
          </p>
          <button
            type="button"
            onClick={() =>
              setCursor(
                view === 'month'
                  ? new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
                  : new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 7),
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-brand-deep hover:bg-brand-soft"
            aria-label="Próximo período"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading && <p className="mt-8 text-sm text-slate-500">Carregando agenda…</p>}

      {!loading && filtered.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title="Nenhuma atividade na agenda"
            message="Assim que a diretoria cadastrar eventos, jogos e treinos, eles aparecem aqui."
          />
        </div>
      )}

      {!loading && filtered.length > 0 && view === 'month' && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-brand-soft">
            {WEEKDAYS_SHORT.map((day) => (
              <div key={day} className="px-1 py-2 text-center font-heading text-[0.55rem] uppercase tracking-[0.08em] text-brand-deep sm:px-2 sm:py-3 sm:text-[0.7rem] sm:tracking-[0.14em]">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthCells.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} className="min-h-[54px] border-b border-r border-slate-100 bg-slate-50/60 sm:min-h-[92px]" />;
              const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const items = grouped.get(key) || [];
              const isToday = key === todayKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay(items.length ? key : null)}
                  className={`min-h-[54px] border-b border-r border-slate-100 p-1 text-left align-top transition-colors hover:bg-brand-soft sm:min-h-[92px] sm:p-2 ${
                    isToday ? 'bg-brand-gold/10' : ''
                  }`}
                >
                  <span
                    className={`font-mono text-[0.62rem] sm:text-xs ${isToday ? 'font-bold text-brand-primary' : 'text-slate-500'}`}
                  >
                    {String(day).padStart(2, '0')}
                  </span>
                  <div className="mt-1 space-y-1">
                    {items.slice(0, 2).map((item) => (
                      <span
                        key={item.id}
                        className="hidden truncate rounded bg-brand-primary/10 px-1.5 py-0.5 text-[0.65rem] text-brand-deep sm:block"
                      >
                        {formatTime(item.time) ? `${formatTime(item.time)} ` : ''}
                        {item.title}
                      </span>
                    ))}
                    {items.length > 0 && (
                      <span className="flex flex-wrap items-center gap-0.5 sm:hidden" aria-label={`${items.length} atividade(s)`}>
                        {items.slice(0, 3).map((item) => (
                          <span key={item.id} className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                        ))}
                      </span>
                    )}
                    {items.length > 2 && (
                      <span className="hidden text-[0.65rem] font-semibold text-brand-primary sm:block">
                        +{items.length - 2} atividade(s)
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!loading && filtered.length > 0 && view === 'week' && (
        <div className="mt-4 grid gap-3 md:grid-cols-7">
          {weekDays.map((day) => {
            const key = dateKey(day.toISOString());
            const items = grouped.get(key) || [];
            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-heading text-[0.65rem] uppercase tracking-[0.14em] text-brand-deep">
                  {WEEKDAYS_SHORT[day.getDay()]} {String(day.getDate()).padStart(2, '0')}
                </p>
                <div className="mt-3 space-y-2">
                  {items.length === 0 && <p className="text-xs text-slate-400">Sem atividades</p>}
                  {items.map((item) => (
                    <div key={item.id} className="rounded-lg bg-brand-soft p-2">
                      <p className="font-mono text-[0.65rem] text-brand-primary">{formatTime(item.time) || '—'}</p>
                      <p className="mt-1 text-xs font-medium text-brand-deep">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && view === 'list' && (
        <div className="mt-4 space-y-3">
          {sortedList.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex gap-4">
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-deep text-white">
                  <span className="font-mono text-lg leading-none">{String(new Date(`${dateKey(item.date)}T12:00:00`).getDate()).padStart(2, '0')}</span>
                  <span className="text-[0.6rem] uppercase tracking-[0.12em] text-brand-gold">
                    {MONTHS_SHORT[new Date(`${dateKey(item.date)}T12:00:00`).getMonth()]}
                  </span>
                </div>
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-primary">
                    {item.category || item.kind || 'Atividade'}
                  </p>
                  <p className="mt-1 font-heading text-base uppercase tracking-tight text-brand-deep">{item.title}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    {item.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {formatTime(item.time)}
                      </span>
                    )}
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {item.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => exportOne(item)}
                className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep hover:bg-brand-soft sm:self-center"
              >
                <Download className="h-3.5 w-3.5" /> Adicionar à agenda
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedDay && (
        <div className="mt-6 rounded-2xl border border-brand-gold/40 bg-brand-soft p-5">
          <div className="flex items-center justify-between">
            <p className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">
              {formatDate(selectedDay)}
            </p>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="text-xs uppercase tracking-[0.14em] text-slate-500 hover:text-brand-deep"
            >
              Fechar
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {(grouped.get(selectedDay) || []).map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-heading text-sm uppercase tracking-tight text-brand-deep">{item.title}</p>
                  <span className="font-mono text-xs text-brand-primary">{formatTime(item.time) || '—'}</span>
                </div>
                {item.location && <p className="mt-2 text-sm text-slate-500">{item.location}</p>}
                {item.description && <p className="mt-2 text-sm text-slate-600">{item.description}</p>}
                <button
                  type="button"
                  onClick={() => exportOne(item)}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary"
                >
                  <Download className="h-3.5 w-3.5" /> Adicionar à minha agenda
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}