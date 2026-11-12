import React from 'react';
import { CalendarClock, MapPin, Trophy } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/format';

export default function MatchCard({ match, sportName }) {
  const finished = match.status === 'finished';
  const cancelled = match.status === 'cancelled';

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-primary">
          <Trophy className="h-3.5 w-3.5" />
          {match.competition || sportName || 'Competição'}
        </span>
        {cancelled && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-red-800">
            Cancelado
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">Lex Leonis</p>
        </div>
        {finished ? (
          <div className="rounded-xl bg-brand-deep px-4 py-2 font-mono text-xl text-brand-gold">
            {Number(match.our_score ?? 0)} <span className="text-white/40">×</span> {Number(match.opponent_score ?? 0)}
          </div>
        ) : (
          <span className="rounded-xl bg-brand-soft px-4 py-2 font-mono text-sm text-brand-deep">
            {formatTime(match.start_time) || 'Horário a definir'}
          </span>
        )}
        <div className="min-w-0 text-right">
          <p className="truncate font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">
            {match.opponent}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-1 text-sm text-slate-500">
        <p className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-brand-primary" />
          {formatDate(match.match_date)} {match.is_home ? '• Em casa' : '• Fora de casa'}
        </p>
        {match.venue && (
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-primary" /> {match.venue}
          </p>
        )}
        {match.round && <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{match.round}</p>}
      </div>
    </article>
  );
}