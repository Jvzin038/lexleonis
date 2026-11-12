import React, { useMemo } from 'react';
import PageHero from '@/components/site/PageHero';
import CalendarBoard from '@/components/site/CalendarBoard';
import useCollection from '@/hooks/useCollection';
import usePageMeta from '@/hooks/usePageMeta';

export default function Calendario() {
  usePageMeta('Calendário', 'Calendário da Atlética Lex Leonis: eventos, jogos, treinos, seletivas e reuniões abertas.');

  const { items: events, loading: loadingEvents } = useCollection(
    'Event',
    { status: { $ne: 'draft' } },
    { sort: 'start_date', limit: 200 },
  );
  const { items: matches, loading: loadingMatches } = useCollection('Match', {}, { sort: 'match_date', limit: 200 });
  const { items: categories } = useCollection('EventCategory', { active: true }, { sort: 'order', limit: 50 });

  const activities = useMemo(() => {
    const fromEvents = events.map((event) => ({
      id: `event-${event.id}`,
      uid: `event-${event.id}@lexleonis`,
      title: event.title,
      date: event.start_date,
      time: event.start_time,
      category: event.category || 'Eventos',
      kind: 'Evento',
      location: event.location_name,
      description: event.short_description,
      url: `${window.location.origin}/eventos/${event.id}`,
    }));

    const fromMatches = matches.map((match) => ({
      id: `match-${match.id}`,
      uid: `match-${match.id}@lexleonis`,
      title: `${match.sport_name || 'Jogo'} — Lex Leonis × ${match.opponent}`,
      date: match.match_date,
      time: match.start_time,
      category: 'Jogos e treinos',
      kind: 'Partida',
      location: match.venue,
      description: match.competition,
      url: `${window.location.origin}/esportes`,
    }));

    return [...fromEvents, ...fromMatches];
  }, [events, matches]);

  const categoryOptions = useMemo(() => {
    const set = new Set(['Jogos e treinos']);
    categories.forEach((item) => set.add(item.name));
    events.forEach((event) => {
      if (event.category) set.add(event.category);
    });
    return Array.from(set);
  }, [categories, events]);

  return (
    <div>
      <PageHero
        eyebrow="Programação"
        title="Calendário e programação"
        subtitle="Eventos, jogos, treinos, seletivas e reuniões abertas. Filtre por categoria, veja os detalhes e adicione as atividades à sua agenda."
      />
      <section className="site-container py-12">
        <CalendarBoard
          activities={activities}
          categories={categoryOptions}
          loading={loadingEvents || loadingMatches}
        />
      </section>
    </div>
  );
}