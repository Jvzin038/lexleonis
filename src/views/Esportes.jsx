import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, CalendarClock, Users } from 'lucide-react';
import { Image } from '@/components/ui/image';
import PageHero from '@/components/site/PageHero';
import EmptyState from '@/components/site/EmptyState';
import useCollection from '@/hooks/useCollection';
import usePageMeta from '@/hooks/usePageMeta';

export default function Esportes() {
  usePageMeta('Esportes', 'As equipes e modalidades esportivas da Atlética Lex Leonis.');
  const { items: sports, loading } = useCollection('Sport', { active: true }, { sort: 'order', limit: 50 });
  const { items: matches } = useCollection('Match', { status: 'scheduled' }, { sort: 'match_date', limit: 20 });

  return (
    <div>
      <PageHero
        eyebrow="Competição"
        title="Esportes"
        subtitle="Futsal, vôlei, basquete e todas as modalidades da Lex Leonis. Elencos, treinos, próximos jogos, resultados e tabelas."
      />

      <section className="site-container py-12">
        {loading && <p className="text-sm text-slate-500">Carregando modalidades…</p>}

        {!loading && sports.length === 0 && (
          <EmptyState
            title="Modalidades em cadastro"
            message="As equipes esportivas da atlética serão apresentadas aqui assim que cadastradas pela diretoria."
          />
        )}

        {!loading && sports.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sports.map((sport) => {
              const nextMatch = matches.find((match) => match.sport_id === sport.id);
              return (
                <article
                  key={sport.id}
                  className="lift flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <Link to={`/esportes/${sport.id}`} className="block aspect-[16/10] overflow-hidden bg-brand-deep">
                    {sport.image_url ? (
                      <Image src={sport.image_url} alt={sport.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-heading text-lg uppercase tracking-[0.2em] text-brand-gold">
                          {sport.name}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">{sport.name}</h2>
                    {sport.competition && (
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-brand-primary">
                        {sport.competition}
                      </p>
                    )}
                    {sport.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {sport.description}
                      </p>
                    )}
                    {nextMatch && (
                      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <CalendarClock className="h-3.5 w-3.5 text-brand-primary" />
                        Próximo jogo contra {nextMatch.opponent}
                      </p>
                    )}
                    {sport.coach && (
                      <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <Users className="h-3.5 w-3.5 text-brand-primary" /> Técnico(a): {sport.coach}
                      </p>
                    )}
                    <Link
                      to={`/esportes/${sport.id}`}
                      className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-brand-primary hover:text-brand-deep"
                    >
                      Ver modalidade <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}