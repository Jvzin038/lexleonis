import React from 'react';
import { Link } from '@/lib/router-compat';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Image } from '@/components/ui/image';
import StatusBadge from './StatusBadge';
import { formatDate, formatTime } from '@/lib/format';

export default function EventCard({ event }) {
  const isCancelled = event.status === 'cancelled';
  const soldOut = event.status === 'sold_out';

  return (
    <article className={`lift group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${isCancelled ? 'opacity-80' : ''}`}>
      <Link to={`/eventos/${event.id}`} className="relative block aspect-[16/10] overflow-hidden bg-brand-soft">
        {event.cover_url ? (
          <Image
            src={event.cover_url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-deep/95">
            <span className="font-heading text-xs uppercase tracking-[0.3em] text-brand-gold">
              {event.category || 'Lex Leonis'}
            </span>
          </div>
        )}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {event.category && (
            <span className="rounded-full bg-brand-deep/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand-gold">
              {event.category}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 font-mono text-xs text-brand-deep">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(event.start_date)}
          </span>
          {event.start_time && (
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 font-mono text-xs text-brand-deep">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(event.start_time)}
            </span>
          )}
          {(isCancelled || soldOut) && <StatusBadge kind="event" value={event.status} />}
        </div>

        <h3 className="mt-4 font-heading text-lg uppercase leading-snug tracking-tight text-brand-deep">
          <Link to={`/eventos/${event.id}`} className="hover:text-brand-primary">
            {event.title}
          </Link>
        </h3>

        {event.short_description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{event.short_description}</p>
        )}

        <div className="mt-4 flex flex-1 flex-col justify-end gap-4">
          {event.location_name && (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4 text-brand-primary" />
              {event.location_name}
            </p>
          )}
          <Link
            to={`/eventos/${event.id}`}
            className={`mt-1 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
              isCancelled
                ? 'bg-slate-200 text-slate-600'
                : 'bg-brand-primary text-white hover:bg-brand-deep'
            }`}
          >
            {isCancelled ? 'Evento cancelado' : soldOut ? 'Ver detalhes' : 'Ver evento e ingressos'}
          </Link>
        </div>
      </div>
    </article>
  );
}