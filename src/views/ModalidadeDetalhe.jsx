import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from '@/lib/router-compat';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import PageHero from '@/components/site/PageHero';
import MatchCard from '@/components/site/MatchCard';
import EmptyState from '@/components/site/EmptyState';
import usePageMeta from '@/hooks/usePageMeta';

export default function ModalidadeDetalhe() {
  const { id } = useParams();
  const [sport, setSport] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  usePageMeta(sport?.name, sport?.description);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const found = await base44.entities.Sport.get(id);
        if (!active) return;
        setSport(found);
        const [athletePage, matchPage, standingPage] = await Promise.all([
          base44.entities.Athlete.filter({ sport_id: id, active: true }, { sort: 'order', limit: 120 }),
          base44.entities.Match.filter({ sport_id: id }, { sort: 'match_date', limit: 120 }),
          base44.entities.Standing.filter({ sport_id: id }, { sort: 'position', limit: 40 }),
        ]);
        if (!active) return;
        setAthletes(athletePage?.items || []);
        setMatches(matchPage?.items || []);
        setStandings(standingPage?.items || []);
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

  const { upcoming, results, staff } = useMemo(() => {
    const team = athletes.filter((item) => item.role !== 'staff');
    const technical = athletes.filter((item) => item.role === 'staff');
    const scheduled = matches
      .filter((match) => match.status === 'scheduled')
      .slice()
      .sort((a, b) => String(a.match_date).localeCompare(String(b.match_date)));
    const finished = matches
      .filter((match) => match.status === 'finished')
      .slice()
      .sort((a, b) => String(b.match_date).localeCompare(String(a.match_date)));
    return { upcoming: scheduled, results: finished, staff: technical, team };
  }, [athletes, matches]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
      </div>
    );
  }

  if (notFound || !sport) {
    return (
      <div className="site-container py-24 text-center">
        <h1 className="font-heading text-2xl uppercase text-brand-deep">Modalidade não encontrada</h1>
        <Link
          to="/esportes"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-deep px-6 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para esportes
        </Link>
      </div>
    );
  }

  const team = athletes.filter((item) => item.role !== 'staff');

  return (
    <div>
      <PageHero
        eyebrow={sport.competition || 'Modalidade'}
        title={sport.name}
        subtitle={sport.description}
        imageUrl={sport.image_url}
      />

      <section className="site-container py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sport.coach && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Comissão técnica</p>
              <p className="mt-2 text-sm font-medium text-brand-deep">{sport.coach}</p>
            </div>
          )}
          {sport.venue && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Local de treino</p>
              <p className="mt-2 text-sm font-medium text-brand-deep">{sport.venue}</p>
            </div>
          )}
          {sport.training_schedule && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Treinos</p>
              <p className="mt-2 text-sm font-medium text-brand-deep">{sport.training_schedule}</p>
            </div>
          )}
          {sport.competition && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Competição</p>
              <p className="mt-2 text-sm font-medium text-brand-deep">{sport.competition}</p>
            </div>
          )}
        </div>

        <div className="mt-14">
          <h2 className="font-heading text-xl uppercase tracking-tight text-brand-deep">Próximas partidas</h2>
          <div className="gavel-rule mt-3" />
          <div className="mt-6">
            {upcoming.length === 0 ? (
              <EmptyState
                title="Sem partidas agendadas"
                message="Quando a tabela da competição for definida, os jogos aparecem aqui."
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((match) => (
                  <MatchCard key={match.id} match={match} sportName={sport.name} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-14">
          <h2 className="font-heading text-xl uppercase tracking-tight text-brand-deep">Resultados</h2>
          <div className="gavel-rule mt-3" />
          <div className="mt-6">
            {results.length === 0 ? (
              <EmptyState
                title="Sem resultados registrados"
                message="Os placares aparecem aqui após a realização das partidas."
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((match) => (
                  <MatchCard key={match.id} match={match} sportName={sport.name} />
                ))}
              </div>
            )}
          </div>
        </div>

        {standings.length > 0 && (
          <div className="mt-14">
            <h2 className="font-heading text-xl uppercase tracking-tight text-brand-deep">Classificação</h2>
            <div className="gavel-rule mt-3" />
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="table-cards cards-standings w-full min-w-[640px] text-sm">
                <thead className="bg-brand-soft">
                  <tr className="text-left font-heading text-[0.7rem] uppercase tracking-[0.14em] text-brand-deep">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Equipe</th>
                    <th className="px-4 py-3">J</th>
                    <th className="px-4 py-3">V</th>
                    <th className="px-4 py-3">E</th>
                    <th className="px-4 py-3">D</th>
                    <th className="px-4 py-3">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-t border-slate-100 ${row.is_our_team ? 'bg-brand-gold/10 font-semibold text-brand-deep' : 'text-slate-600'}`}
                    >
                      <td className="px-4 py-3 font-mono">{row.position}</td>
                      <td className="px-4 py-3">{row.team_name}</td>
                      <td className="px-4 py-3 font-mono">{row.played}</td>
                      <td className="px-4 py-3 font-mono">{row.wins}</td>
                      <td className="px-4 py-3 font-mono">{row.draws}</td>
                      <td className="px-4 py-3 font-mono">{row.losses}</td>
                      <td className="px-4 py-3 font-mono">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Dados administrados pela diretoria de esportes. A tabela é atualizada manualmente conforme a competição.
            </p>
          </div>
        )}

        <div className="mt-14">
          <h2 className="font-heading text-xl uppercase tracking-tight text-brand-deep">Elenco</h2>
          <div className="gavel-rule mt-3" />
          <div className="mt-6">
            {team.length === 0 ? (
              <EmptyState
                title="Elenco em cadastro"
                message="Os atletas da modalidade serão publicados pela diretoria de esportes."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {team.map((athlete) => (
                  <div key={athlete.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                    {athlete.photo_url ? (
                      <Image
                        src={athlete.photo_url}
                        alt={athlete.name}
                        className="h-14 w-14 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-soft font-heading text-sm text-brand-primary">
                        {athlete.number || 'LL'}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-brand-deep">{athlete.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {athlete.position || 'Atleta'}
                        {athlete.number ? ` • nº ${athlete.number}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {staff.length > 0 && (
          <div className="mt-14">
            <h2 className="font-heading text-xl uppercase tracking-tight text-brand-deep">Comissão técnica</h2>
            <div className="gavel-rule mt-3" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {staff.map((member) => (
                <div key={member.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="font-medium text-brand-deep">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.staff_role || 'Comissão técnica'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}