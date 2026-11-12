import React from 'react';
import { LogOut, Megaphone } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHero from '@/components/site/PageHero';
import EmptyState from '@/components/site/EmptyState';
import StudentProfile from '@/components/student/StudentProfile';
import StudentRegistrations from '@/components/student/StudentRegistrations';
import StudentTickets from '@/components/student/StudentTickets';
import StudentOrders from '@/components/student/StudentOrders';
import useCollection from '@/hooks/useCollection';
import usePageMeta from '@/hooks/usePageMeta';
import { useAuth } from '@/lib/AuthContext';
import { formatDate } from '@/lib/format';

export default function MinhaArea() {
  usePageMeta('Minha área', 'Suas inscrições, ingressos e pedidos da Atlética Lex Leonis.');
  const { user, logout } = useAuth();
  const userId = user?.id;

  const { items: registrations, loading: loadingRegistrations, reload: reloadRegistrations } = useCollection(
    'Registration',
    userId ? { user_id: userId } : { user_id: '__none__' },
    { sort: '-created_date', limit: 100, enabled: Boolean(userId) },
  );
  const { items: tickets, loading: loadingTickets } = useCollection(
    'Ticket',
    userId ? { user_id: userId } : { user_id: '__none__' },
    { sort: '-issued_at', limit: 100, enabled: Boolean(userId) },
  );
  const { items: orders, loading: loadingOrders } = useCollection(
    'Order',
    userId ? { user_id: userId } : { user_id: '__none__' },
    { sort: '-created_date', limit: 100, enabled: Boolean(userId) },
  );
  const { items: orderItems } = useCollection(
    'OrderItem',
    orders.length ? { order_id: { $in: orders.map((order) => order.id) } } : { order_id: '__none__' },
    { sort: 'created_date', limit: 300, enabled: orders.length > 0 },
  );
  const { items: announcements } = useCollection(
    'Post',
    { status: 'published', audience: 'students' },
    { sort: '-published_date', limit: 20 },
  );

  const itemsByOrder = orderItems.reduce((map, item) => {
    if (!map[item.order_id]) map[item.order_id] = [];
    map[item.order_id].push(item);
    return map;
  }, {});

  const cancelRegistration = async (registration) => {
    await base44.functions.invoke('cancelRegistration', { registration_id: registration.id });
    await reloadRegistrations();
  };

  return (
    <div>
      <PageHero
        eyebrow="Área do aluno"
        title={user?.full_name ? `Olá, ${user.full_name.split(' ')[0]}` : 'Minha área'}
        subtitle="Acompanhe suas inscrições, ingressos digitais e pedidos da loja oficial."
      >
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
        >
          <LogOut className="h-4 w-4" /> Sair da conta
        </button>
      </PageHero>

      <section className="site-container py-12">
        <Tabs defaultValue="inscricoes">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            {[
              { value: 'inscricoes', label: 'Inscrições' },
              { value: 'ingressos', label: 'Ingressos' },
              { value: 'pedidos', label: 'Pedidos' },
              { value: 'comunicados', label: 'Comunicados' },
              { value: 'perfil', label: 'Meus dados' },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-deep data-[state=active]:border-brand-deep data-[state=active]:bg-brand-deep data-[state=active]:text-white"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="inscricoes" className="mt-8">
            {loadingRegistrations ? (
              <p className="text-sm text-slate-500">Carregando inscrições…</p>
            ) : (
              <StudentRegistrations registrations={registrations} onCancel={cancelRegistration} />
            )}
          </TabsContent>

          <TabsContent value="ingressos" className="mt-8">
            {loadingTickets ? (
              <p className="text-sm text-slate-500">Carregando ingressos…</p>
            ) : (
              <StudentTickets tickets={tickets} />
            )}
          </TabsContent>

          <TabsContent value="pedidos" className="mt-8">
            {loadingOrders ? (
              <p className="text-sm text-slate-500">Carregando pedidos…</p>
            ) : (
              <StudentOrders orders={orders} itemsByOrder={itemsByOrder} />
            )}
          </TabsContent>

          <TabsContent value="comunicados" className="mt-8">
            {announcements.length === 0 ? (
              <EmptyState
                title="Nenhum comunicado direcionado"
                message="Comunicados exclusivos para alunos aparecem aqui quando publicados pela diretoria."
              />
            ) : (
              <div className="space-y-4">
                {announcements.map((post) => (
                  <div key={post.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-brand-primary">
                      <Megaphone className="h-3.5 w-3.5" /> {formatDate(post.published_date || post.created_date)}
                    </p>
                    <p className="mt-3 font-heading text-base uppercase tracking-tight text-brand-deep">
                      {post.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {post.subtitle || post.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="perfil" className="mt-8">
            <StudentProfile user={user} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}