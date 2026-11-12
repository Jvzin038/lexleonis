import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, CalendarDays, Instagram, Youtube, Facebook, Music2, Quote } from 'lucide-react';
import SectionHeading from './SectionHeading';
import EventCard from './EventCard';
import PostCard from './PostCard';
import ProductCard from './ProductCard';
import AlbumCard from './AlbumCard';
import SponsorGrid from './SponsorGrid';
import MatchCard from './MatchCard';
import HeroSection from './HeroSection';
import EmptyState from './EmptyState';
import { formatDate, formatTime, truncate } from '@/lib/format';
import { useSite } from '@/lib/site';

function GridFrame({ children }) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

export default function SectionRenderer({ section, data, matches = [] }) {
  const { settings } = useSite();
  const limit = Number(section.item_limit || 3);
  const deep = section.background === 'deep';
  const gold = section.background === 'gold';

  const wrapperClass = deep
    ? 'bg-brand-deep text-white'
    : gold
      ? 'bg-brand-gold text-brand-ink'
      : 'bg-white';

  const body = () => {
    switch (section.section_type) {
      case 'hero':
        return <HeroSection section={section} settings={settings} />;

      case 'events': {
        const items = data.events.slice(0, limit);
        return items.length ? (
          <GridFrame>
            {items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </GridFrame>
        ) : (
          <EmptyState
            title="Nenhum evento com data marcada"
            message="Quando a diretoria publicar um evento, ele aparece aqui automaticamente."
            actionLabel="Ver todos os eventos"
            actionTo="/eventos"
          />
        );
      }

      case 'featured_events': {
        const items = data.featured.slice(0, limit);
        if (!items.length) return null;
        return (
          <div className="grid gap-6 lg:grid-cols-3">
            {items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        );
      }

      case 'calendar': {
        const upcoming = [...matches].slice(0, limit);
        return upcoming.length ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {upcoming.map((match) => (
                <div key={match.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="font-mono text-xs text-brand-primary">{formatDate(match.match_date)}</p>
                  <p className="mt-1 font-heading text-sm uppercase tracking-tight text-brand-deep">
                    {match.sport_name || 'Atividade'} — Lex Leonis × {match.opponent}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatTime(match.start_time) || 'Horário a definir'}
                    {match.venue ? ` • ${match.venue}` : ''}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center rounded-2xl bg-brand-deep p-8 text-white">
              <CalendarDays className="h-8 w-8 text-brand-gold" />
              <p className="mt-4 font-heading text-lg uppercase tracking-tight">
                Agenda completa de eventos, jogos e treinos
              </p>
              <p className="mt-3 text-sm text-white/70">
                Veja o calendário mensal, semanal e a lista cronológica — e salve as atividades na sua agenda.
              </p>
              <Link
                to="/calendario"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-ink"
              >
                Abrir calendário <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Agenda em preparação"
            message="Os próximos jogos e atividades aparecem aqui assim que forem cadastrados."
            actionLabel="Ver calendário"
            actionTo="/calendario"
          />
        );
      }

      case 'matches': {
        const items = matches.slice(0, limit);
        return items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((match) => (
              <MatchCard key={match.id} match={match} sportName={match.sport_name} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma partida agendada"
            message="A tabela de jogos da atlética será publicada pela diretoria de esportes."
            actionLabel="Ver esportes"
            actionTo="/esportes"
          />
        );
      }

      case 'gallery': {
        const items = data.albums.slice(0, limit);
        return items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum álbum publicado"
            message="Os registros fotográficos dos eventos aparecem aqui depois de publicados."
            actionLabel="Ver momentos"
            actionTo="/momentos"
          />
        );
      }

      case 'news': {
        const items = data.posts.slice(0, limit);
        return items.length ? (
          <GridFrame>
            {items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </GridFrame>
        ) : (
          <EmptyState
            title="Nenhuma publicação ainda"
            message="Notícias e comunicados oficiais são publicados pela diretoria."
            actionLabel="Ver notícias"
            actionTo="/noticias"
          />
        );
      }

      case 'shop': {
        const items = data.products.slice(0, limit);
        return items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Loja em preparação"
            message="Os produtos oficiais da atlética serão publicados em breve."
            actionLabel="Visitar loja"
            actionTo="/loja"
          />
        );
      }

      case 'sponsors': {
        const items = data.sponsors.slice(0, limit);
        return items.length ? (
          <SponsorGrid sponsors={items} light={deep} />
        ) : (
          <EmptyState
            title="Espaço para patrocinadores"
            message="Quer apoiar a atlética? Fale com a diretoria para conhecer as cotas de patrocínio."
            actionLabel="Seja patrocinador"
            actionTo="/seja-patrocinador"
          />
        );
      }

      case 'social': {
        const socials = [
          { url: settings.instagram, icon: Instagram, label: 'Instagram' },
          { url: settings.tiktok, icon: Music2, label: 'TikTok' },
          { url: settings.youtube, icon: Youtube, label: 'YouTube' },
          { url: settings.facebook, icon: Facebook, label: 'Facebook' },
        ].filter((item) => item.url);
        return (
          <div className="rounded-2xl bg-brand-deep p-8 text-white sm:p-12">
            <div className="max-w-2xl">
              {section.body && <p className="text-base leading-relaxed text-white/80">{section.body}</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                {socials.length === 0 && (
                  <p className="text-sm text-white/60">
                    Os perfis oficiais da atlética serão exibidos aqui assim que cadastrados no painel.
                  </p>
                )}
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium transition-colors hover:border-brand-gold hover:text-brand-gold"
                  >
                    <social.icon className="h-4 w-4" /> {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'about':
        return (
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              {section.body && <p className="site-prose text-slate-600">{section.body}</p>}
              <Link
                to={section.cta_url || '/atletica'}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-brand-primary hover:text-brand-deep"
              >
                {section.cta_label || 'Conhecer a atlética'} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {settings.mission_text && (
              <blockquote className={`rounded-2xl p-8 ${deep ? 'bg-white/5' : 'bg-brand-soft'}`}>
                <Quote className={`h-6 w-6 ${deep ? 'text-brand-gold' : 'text-brand-primary'}`} />
                <p className={`mt-4 text-base leading-relaxed ${deep ? 'text-white/85' : 'text-slate-700'}`}>
                  {truncate(settings.mission_text, 260)}
                </p>
              </blockquote>
            )}
          </div>
        );

      case 'cta':
        return (
          <div className="rounded-2xl border border-brand-gold/40 bg-brand-soft p-8 text-center sm:p-12">
            <h3 className="font-heading text-2xl uppercase tracking-tight text-brand-deep">{section.title}</h3>
            {section.body && <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">{section.body}</p>}
            <Link
              to={section.cta_url || '/eventos'}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              {section.cta_label || 'Saiba mais'} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        );

      case 'text':
      default:
        return (
          <div className="site-prose max-w-3xl text-slate-600">
            {section.body
              ? section.body.split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)
              : null}
            {section.cta_label && (
              <Link
                to={section.cta_url || '/'}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-brand-primary"
              >
                {section.cta_label} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        );
    }
  };

  const content = body();

  if (section.section_type === 'hero') return content;

  // Seção sem conteúdo (ex.: destaques sem eventos marcados) não reserva espaço em branco na página
  if (!content) return null;

  return (
    <section className={wrapperClass}>
      <div className="site-container py-16 sm:py-20 lg:py-24">
        {(section.title || section.subtitle) && section.section_type !== 'cta' && (
          <div className="mb-10">
            <SectionHeading
              eyebrow={section.subtitle ? undefined : undefined}
              title={section.title}
              subtitle={section.subtitle || undefined}
              light={deep}
              linkTo={section.cta_url && section.cta_label ? section.cta_url : undefined}
              linkLabel={section.cta_label}
            />
          </div>
        )}
        {content}
      </div>
    </section>
  );
}