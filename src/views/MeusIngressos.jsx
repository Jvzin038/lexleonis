import React, { useState } from 'react';
import PageHero from '@/components/site/PageHero';
import StudentTickets from '@/components/student/StudentTickets';
import useCollection from '@/hooks/useCollection';
import usePageMeta from '@/hooks/usePageMeta';
import { useAuth } from '@/lib/AuthContext';

const TABS = [
  {
    value: 'proximos',
    label: 'Próximos eventos',
    query: (userId) => ({ user_id: userId, status: 'valid' }),
    emptyTitle: 'Nenhum ingresso válido',
    emptyMessage: 'Seus ingressos confirmados para os próximos eventos aparecem aqui, com o QR Code de entrada.',
  },
  {
    value: 'historico',
    label: 'Histórico',
    query: (userId) => ({ user_id: userId, status: { $in: ['used', 'expired', 'cancelled', 'refunded'] } }),
    emptyTitle: 'Histórico vazio',
    emptyMessage: 'Ingressos já utilizados, cancelados ou expirados ficam guardados aqui como histórico.',
  },
  {
    value: 'todos',
    label: 'Todos',
    query: (userId) => ({ user_id: userId }),
    emptyTitle: 'Nenhum ingresso emitido',
    emptyMessage: 'Solicite seu ingresso em um evento e acompanhe aqui a emissão, o pagamento e a entrada.',
  },
];

export default function MeusIngressos() {
  usePageMeta('Meus ingressos', 'Seus ingressos digitais da Atlética Lex Leonis com QR Code de entrada.');
  const { user } = useAuth();
  const [tab, setTab] = useState('proximos');
  const active = TABS.find((item) => item.value === tab) || TABS[0];
  const userId = user?.id;

  const { items, loading } = useCollection(
    'Ticket',
    userId ? active.query(userId) : { user_id: '__none__' },
    { sort: '-issued_at', limit: 60, enabled: Boolean(userId) },
  );

  return (
    <div>
      <PageHero
        eyebrow="Área do aluno"
        title="Meus ingressos"
        subtitle="Apresente o QR Code na entrada do evento. Cada ingresso tem um código exclusivo validado pela organização."
      />

      <section className="site-container py-12">
        <div className="flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
                tab === item.value
                  ? 'border-brand-deep bg-brand-deep text-white'
                  : 'border-slate-200 bg-white text-brand-deep hover:border-brand-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
            </div>
          ) : (
            <StudentTickets tickets={items} emptyTitle={active.emptyTitle} emptyMessage={active.emptyMessage} />
          )}
        </div>
      </section>
    </div>
  );
}