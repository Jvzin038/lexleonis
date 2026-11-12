import React, { useEffect, useState } from 'react';
import { Link, useParams } from '@/lib/router-compat';
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Clock,
  Download,
  Images,
  MapPin,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import PageHero from '@/components/site/PageHero';
import RegistrationPanel from '@/components/site/RegistrationPanel';
import StatusBadge from '@/components/site/StatusBadge';
import usePageMeta from '@/hooks/usePageMeta';
import { buildIcs } from '@/lib/ics';
import { downloadTextFile, formatDateRange, formatTime } from '@/lib/format';

export default function EventoDetalhe() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  usePageMeta(event?.title, event?.short_description);

  const loadTickets = async () => {
    const page = await base44.entities.TicketType.filter(
      { event_id: id, active: true },
      { sort: 'order', limit: 20 },
    );
    setTicketTypes(page?.items || []);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const found = await base44.entities.Event.get(id);
        if (!active) return;
        setEvent(found);
        try {
          await base44.functions.invoke('evaluateBatches', { action: 'evaluate', event_id: id });
        } catch (evalError) {
          // ignore — batch evaluation runs opportunistically
        }
        const page = await base44.entities.TicketType.filter(
          { event_id: id, active: true },
          { sort: 'order', limit: 20 },
        );
        if (active) setTicketTypes(page?.items || []);
      } catch (error) {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const addToCalendar = () => {
    const ics = buildIcs([
      {
        uid: `event-${event.id}@lexleonis`,
        title: event.title,
        date: event.start_date,
        time: event.start_time,
        description: event.short_description,
        location: [event.location_name, event.address].filter(Boolean).join(' — '),
        url: window.location.href,
      },
    ]);
    downloadTextFile(`lex-leonis-${event.slug || event.id}.ics`, ics, 'text/calendar;charset=utf-8');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="site-container py-24 text-center">
        <h1 className="font-heading text-2xl uppercase text-brand-deep">Evento não encontrado</h1>
        <p className="mt-3 text-sm text-slate-600">
          O evento pode ter sido removido ou o endereço está incorreto.
        </p>
        <Link
          to="/eventos"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-deep px-6 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para eventos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow={event.category || 'Evento'}
        title={event.title}
        subtitle={event.short_description}
        imageUrl={event.cover_url}
      />

      <section className="site-container py-12">
        {event.announcement && (
          <div className="mb-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{event.announcement}</p>
          </div>
        )}

        {event.status === 'cancelled' && (
          <div className="mb-8 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Este evento foi cancelado. Inscrições e ingressos serão tratados pela diretoria da atlética.</p>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge kind="event" value={event.status} />
              {event.featured && (
                <span className="rounded-full bg-brand-gold px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-ink">
                  Destaque
                </span>
              )}
            </div>

            <dl className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <CalendarDays className="h-4 w-4 text-brand-primary" /> Data
                </dt>
                <dd className="mt-2 text-sm font-medium text-brand-deep">
                  {formatDateRange(event.start_date, event.end_date)}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <Clock className="h-4 w-4 text-brand-primary" /> Horário
                </dt>
                <dd className="mt-2 text-sm font-medium text-brand-deep">
                  {formatTime(event.start_time) || 'A definir'}
                  {event.end_time ? ` — ${formatTime(event.end_time)}` : ''}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <MapPin className="h-4 w-4 text-brand-primary" /> Local
                </dt>
                <dd className="mt-2 text-sm font-medium text-brand-deep">
                  {event.location_name || 'A definir'}
                  {event.address && <span className="mt-1 block text-slate-500">{event.address}</span>}
                </dd>
                {event.map_url && (
                  <a
                    href={event.map_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary"
                  >
                    Abrir no mapa
                  </a>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <UserRound className="h-4 w-4 text-brand-primary" /> Organização
                </dt>
                <dd className="mt-2 text-sm font-medium text-brand-deep">
                  {event.organizer || 'Atlética Lex Leonis'}
                </dd>
                {event.age_rating && (
                  <dd className="mt-1 text-xs text-slate-500">Classificação: {event.age_rating}</dd>
                )}
              </div>
            </dl>

            {event.description && (
              <div className="mt-10">
                <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Sobre o evento</h2>
                <div className="gavel-rule mt-3" />
                <div className="site-prose mt-5 text-slate-600">
                  {event.description.split('\n').filter(Boolean).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {event.rules && (
              <div className="mt-10">
                <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">
                  Regras e orientações
                </h2>
                <div className="gavel-rule mt-3" />
                <div className="site-prose mt-5 text-slate-600">
                  {event.rules.split('\n').filter(Boolean).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {event.accessibility && (
              <div className="mt-10 flex gap-3 rounded-2xl bg-brand-soft p-5 text-sm text-slate-700">
                <Accessibility className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                <div>
                  <p className="font-semibold text-brand-deep">Acessibilidade</p>
                  <p className="mt-1">{event.accessibility}</p>
                </div>
              </div>
            )}

            {event.gallery_album_id && (
              <Link
                to={`/momentos/${event.gallery_album_id}`}
                className="mt-10 inline-flex items-center gap-2 rounded-full border border-brand-deep px-5 py-3 text-sm font-semibold text-brand-deep transition-colors hover:bg-brand-deep hover:text-white"
              >
                <Images className="h-4 w-4" /> Ver galeria deste evento
              </Link>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <RegistrationPanel event={event} ticketTypes={ticketTypes} onRegistered={loadTickets} />

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-heading text-xs uppercase tracking-[0.16em] text-brand-deep">Salvar na agenda</p>
              <p className="mt-2 text-sm text-slate-600">
                Adicione este evento ao calendário do seu celular ou computador.
              </p>
              <button
                type="button"
                onClick={addToCalendar}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-brand-deep transition-colors hover:bg-brand-soft"
              >
                <Download className="h-4 w-4" /> Baixar arquivo da agenda
              </button>
            </div>

            {event.contact_email && (
              <div className="mt-4 rounded-2xl bg-brand-deep p-5 text-white">
                <p className="font-heading text-xs uppercase tracking-[0.16em] text-brand-gold">Dúvidas</p>
                <p className="mt-2 text-sm text-white/75">
                  Fale com a organização pelo e-mail <span className="font-medium text-white">{event.contact_email}</span>.
                </p>
              </div>
            )}

            <div className="mt-4 overflow-hidden rounded-2xl">
              {event.cover_url ? (
                <Image src={event.cover_url} alt={event.title} className="h-40 w-full object-cover" />
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}