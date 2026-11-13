import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import EntityManager from '@/components/admin/EntityManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/format';

const TAB_CLASS =
  'rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-deep data-[state=active]:border-brand-deep data-[state=active]:bg-brand-deep data-[state=active]:text-white';

const MATCH_STATUS = [
  { value: 'scheduled', label: 'Agendada' },
  { value: 'finished', label: 'Realizada' },
  { value: 'cancelled', label: 'Cancelada' },
];

export default function AdminEsportes() {
  const [sports, setSports] = useState([]);

  const loadSports = useCallback(async () => {
    const page = await base44.entities.Sport.filter({}, { sort: 'order', limit: 100 });
    setSports(page?.items || []);
  }, []);

  useEffect(() => {
    loadSports();
  }, [loadSports]);

  const sportOptions = sports.map((sport) => ({ value: sport.id, label: sport.name }));
  const sportMap = sports.reduce((map, sport) => ({ ...map, [sport.id]: sport.name }), {});
  const withSportName = (payload) => ({ ...payload, sport_name: sportMap[payload.sport_id] || payload.sport_name || '' });

  return (
    <Tabs defaultValue="modalidades">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
        <TabsTrigger value="modalidades" className={TAB_CLASS}>
          Modalidades
        </TabsTrigger>
        <TabsTrigger value="atletas" className={TAB_CLASS}>
          Atletas e comissão
        </TabsTrigger>
        <TabsTrigger value="partidas" className={TAB_CLASS}>
          Partidas e resultados
        </TabsTrigger>
        <TabsTrigger value="tabela" className={TAB_CLASS}>
          Tabela do campeonato
        </TabsTrigger>
      </TabsList>

      <TabsContent value="modalidades" className="mt-8">
        <EntityManager
          title="Modalidades esportivas"
          subtitle="Cadastre novas modalidades sem precisar de desenvolvimento. Cada modalidade tem sua própria página pública."
          entity="Sport"
          sort="order"
          searchField="name"
          defaults={{ active: true }}
          columns={[
            { key: 'name', label: 'Modalidade' },
            { key: 'competition', label: 'Competição' },
            { key: 'coach', label: 'Comissão técnica' },
            { key: 'active', label: 'Ativa', render: (row) => (row.active ? 'Sim' : 'Não') },
          ]}
          fields={[
            { name: 'name', label: 'Nome da modalidade', required: true },
            { name: 'competition', label: 'Competição' },
            { name: 'description', label: 'Descrição', type: 'textarea', colSpan: 2 },
            { name: 'image_url', label: 'Imagem / escudo', type: 'image', colSpan: 2 },
            { name: 'coach', label: 'Comissão técnica' },
            { name: 'venue', label: 'Local de treino' },
            { name: 'training_schedule', label: 'Horários de treino', colSpan: 2 },
            { name: 'order', label: 'Ordem', type: 'number' },
            { name: 'active', label: 'Publicar no site', type: 'switch' },
          ]}
        />
      </TabsContent>

      <TabsContent value="atletas" className="mt-8">
        <EntityManager
          title="Atletas e comissão técnica"
          entity="Athlete"
          sort="order"
          searchField="name"
          defaults={{ active: true, role: 'athlete' }}
          transform={withSportName}
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'sport_name', label: 'Modalidade' },
            { key: 'number', label: 'Nº' },
            { key: 'position', label: 'Posição' },
            { key: 'role', label: 'Função', render: (row) => (row.role === 'staff' ? 'Comissão' : 'Atleta') },
          ]}
          fields={[
            { name: 'name', label: 'Nome', required: true, colSpan: 2 },
            { name: 'sport_id', label: 'Modalidade', type: 'relation', options: sportOptions, required: true },
            { name: 'role', label: 'Função', type: 'select', options: [{ value: 'athlete', label: 'Atleta' }, { value: 'staff', label: 'Comissão técnica' }] },
            { name: 'photo_url', label: 'Foto', type: 'image', colSpan: 2 },
            { name: 'number', label: 'Número' },
            { name: 'position', label: 'Posição' },
            { name: 'staff_role', label: 'Cargo na comissão' },
            { name: 'order', label: 'Ordem', type: 'number' },
            { name: 'active', label: 'Exibir no site', type: 'switch' },
          ]}
        />
      </TabsContent>

      <TabsContent value="partidas" className="mt-8">
        <EntityManager
          title="Partidas e resultados"
          subtitle="Agende jogos e registre placares apenas após a realização das partidas."
          entity="Match"
          sort="-match_date"
          searchField="opponent"
          defaults={{ status: 'scheduled', is_home: true }}
          transform={withSportName}
          columns={[
            { key: 'match_date', label: 'Data', render: (row) => formatDate(row.match_date) },
            { key: 'sport_name', label: 'Modalidade' },
            { key: 'opponent', label: 'Adversário' },
            { key: 'competition', label: 'Competição' },
            {
              key: 'score',
              label: 'Placar',
              render: (row) =>
                row.status === 'finished' ? `${Number(row.our_score ?? 0)} × ${Number(row.opponent_score ?? 0)}` : '—',
            },
            {
              key: 'status',
              label: 'Situação',
              render: (row) => MATCH_STATUS.find((item) => item.value === row.status)?.label || row.status,
            },
          ]}
          fields={[
            { name: 'sport_id', label: 'Modalidade', type: 'relation', options: sportOptions, required: true },
            { name: 'opponent', label: 'Adversário', required: true },
            { name: 'competition', label: 'Competição' },
            { name: 'round', label: 'Rodada / fase' },
            { name: 'match_date', label: 'Data', type: 'date', required: true },
            { name: 'start_time', label: 'Horário', type: 'time' },
            { name: 'venue', label: 'Local', colSpan: 2 },
            { name: 'is_home', label: 'Jogo em casa', type: 'switch' },
            { name: 'status', label: 'Situação', type: 'select', options: MATCH_STATUS },
            { name: 'our_score', label: 'Gols/pontos da Lex Leonis', type: 'number' },
            { name: 'opponent_score', label: 'Gols/pontos do adversário', type: 'number' },
            { name: 'notes', label: 'Observações', type: 'textarea', colSpan: 2 },
          ]}
        />
      </TabsContent>

      <TabsContent value="tabela" className="mt-8">
        <EntityManager
          title="Tabela do campeonato"
          subtitle="Preencha a classificação conforme a competição avança. Marque “nosso time” para destacar a Lex Leonis na tabela."
          entity="Standing"
          sort="position"
          defaults={{ is_our_team: false }}
          columns={[
            { key: 'position', label: '#' },
            { key: 'team_name', label: 'Equipe' },
            { key: 'played', label: 'J' },
            { key: 'wins', label: 'V' },
            { key: 'draws', label: 'E' },
            { key: 'losses', label: 'D' },
            { key: 'points', label: 'Pts' },
            { key: 'is_our_team', label: 'Nossa equipe', render: (row) => (row.is_our_team ? 'Sim' : '—') },
          ]}
          fields={[
            { name: 'sport_id', label: 'Modalidade', type: 'relation', options: sportOptions, required: true },
            { name: 'competition', label: 'Competição' },
            { name: 'team_name', label: 'Equipe', required: true },
            { name: 'position', label: 'Posição', type: 'number' },
            { name: 'played', label: 'Jogos', type: 'number' },
            { name: 'wins', label: 'Vitórias', type: 'number' },
            { name: 'draws', label: 'Empates', type: 'number' },
            { name: 'losses', label: 'Derrotas', type: 'number' },
            { name: 'points', label: 'Pontos', type: 'number' },
            { name: 'is_our_team', label: 'É a equipe da Lex Leonis', type: 'switch' },
          ]}
        />
      </TabsContent>
    </Tabs>
  );
}