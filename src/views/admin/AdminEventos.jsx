import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import EntityManager from '@/components/admin/EntityManager';
import StatusBadge from '@/components/site/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';

const TAB_CLASS =
  'rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-deep data-[state=active]:border-brand-deep data-[state=active]:bg-brand-deep data-[state=active]:text-white';

const EVENT_STATUS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'sold_out', label: 'Esgotado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'finished', label: 'Encerrado' },
];

const REGISTRATION_MODE = [
  { value: 'none', label: 'Sem inscrição' },
  { value: 'free', label: 'Inscrição gratuita' },
  { value: 'paid', label: 'Ingresso pago' },
  { value: 'waitlist', label: 'Lista de espera' },
  { value: 'external', label: 'Link externo' },
];

const ROTATION_MODE = [
  { value: 'sold_out', label: 'Esgotar para virar' },
  { value: 'date', label: 'Virar por data' },
  { value: 'both', label: 'Esgotar ou por data' },
  { value: 'manual', label: 'Manual (só admin)' },
];

export default function AdminEventos() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);

  useEffect(() => {
    (async () => {
      const [eventPage, categoryPage, ticketTypePage] = await Promise.all([
        base44.entities.Event.filter({}, { sort: '-start_date', limit: 300 }),
        base44.entities.EventCategory.filter({}, { sort: 'order', limit: 100 }),
        base44.entities.TicketType.filter({}, { sort: 'order', limit: 500 }),
      ]);
      setEvents(eventPage?.items || []);
      setCategories(categoryPage?.items || []);
      setTicketTypes(ticketTypePage?.items || []);
    })();
  }, []);

  const eventOptions = events.map((event) => ({ value: event.id, label: event.title }));
  const eventMap = events.reduce((map, event) => ({ ...map, [event.id]: event.title }), {});
  const categoryOptions = categories.map((category) => category.name);
  const batchOptions = ticketTypes.map((tt) => ({
    value: tt.id,
    label: `${tt.name}${tt.event_title ? ` — ${tt.event_title}` : ''}`,
  }));

  return (
    <Tabs defaultValue="eventos">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
        <TabsTrigger value="eventos" className={TAB_CLASS}>
          Eventos
        </TabsTrigger>
        <TabsTrigger value="lotes" className={TAB_CLASS}>
          Lotes de ingressos
        </TabsTrigger>
        <TabsTrigger value="categorias" className={TAB_CLASS}>
          Categorias
        </TabsTrigger>
      </TabsList>

      <TabsContent value="eventos" className="mt-8">
        <EntityManager
          title="Eventos"
          subtitle="Tudo que for publicado aqui aparece automaticamente na página de eventos e no calendário do site."
          entity="Event"
          sort="-start_date"
          searchField="title"
          searchPlaceholder="Buscar evento…"
          allowDuplicate
          defaults={{ status: 'published', registration_mode: 'none', featured: false }}
          transform={(payload) => ({ ...payload, slug: payload.slug || undefined })}
          columns={[
            { key: 'title', label: 'Evento' },
            {
              key: 'start_date',
              label: 'Data',
              render: (row) =>
                row.start_time ? `${formatDate(row.start_date)} • ${formatTime(row.start_time)}` : formatDate(row.start_date),
            },
            { key: 'category', label: 'Categoria' },
            { key: 'location_name', label: 'Local' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge kind="event" value={row.status} /> },
            { key: 'featured', label: 'Destaque', render: (row) => (row.featured ? 'Sim' : '—') },
          ]}
          fields={[
            { name: 'title', label: 'Nome do evento', required: true, colSpan: 2 },
            {
              name: 'announcement',
              label: 'Aviso em destaque (alterações, cancelamento, orientações)',
              type: 'textarea',
              rows: 3,
              colSpan: 2,
            },
            { name: 'cover_url', label: 'Imagem de capa', type: 'image', colSpan: 2 },
            { name: 'short_description', label: 'Resumo curto', colSpan: 2 },
            { name: 'description', label: 'Descrição completa', type: 'textarea', rows: 8, colSpan: 2 },
            { name: 'category', label: 'Categoria', type: 'select', options: categoryOptions },
            { name: 'organizer', label: 'Organizador' },
            { name: 'start_date', label: 'Data de início', type: 'date', required: true },
            { name: 'end_date', label: 'Data de término', type: 'date' },
            { name: 'start_time', label: 'Horário de início', type: 'time' },
            { name: 'end_time', label: 'Horário de término', type: 'time' },
            { name: 'location_name', label: 'Local' },
            { name: 'address', label: 'Endereço' },
            { name: 'map_url', label: 'Link do mapa', colSpan: 2 },
            { name: 'age_rating', label: 'Classificação etária', placeholder: 'Ex.: 18 anos' },
            { name: 'capacity', label: 'Capacidade', type: 'number' },
            { name: 'rules', label: 'Regras e orientações', type: 'textarea', rows: 5, colSpan: 2 },
            { name: 'accessibility', label: 'Informações de acessibilidade', type: 'textarea', rows: 3, colSpan: 2 },
            { name: 'status', label: 'Status', type: 'select', options: EVENT_STATUS },
            {
              name: 'registration_mode',
              label: 'Forma de inscrição',
              type: 'select',
              options: REGISTRATION_MODE,
              help: 'Para venda de ingressos escolha “Ingresso pago” e cadastre os lotes na aba Lotes de ingressos.',
            },
            { name: 'registration_url', label: 'Link externo de inscrição' },
            { name: 'contact_email', label: 'E-mail de contato do evento' },
            { name: 'featured', label: 'Destacar na página inicial', type: 'switch' },
            {
              name: 'require_participant_cpf',
              label: 'Exigir CPF de cada participante',
              type: 'switch',
              help: 'Quando ativo, o CPF é obrigatório em cada ingresso. Quando inativo, aparece como opcional.',
            },
            {
              name: 'require_participant_email',
              label: 'Exigir e-mail de cada participante',
              type: 'switch',
            },
            {
              name: 'require_participant_phone',
              label: 'Exigir telefone de cada participante',
              type: 'switch',
            },
          ]}
        />
      </TabsContent>

      <TabsContent value="lotes" className="mt-8">
        <EntityManager
          title="Lotes de ingressos"
          subtitle="Crie os lotes de cada evento, defina preços, quantidades e a janela de vendas. O ingresso só é emitido após o pagamento confirmado."
          entity="TicketType"
          sort="order"
          defaults={{ active: true, is_free: false, quantity_sold: 0, max_per_buyer: 4 }}
          transform={(payload) => ({ ...payload, event_title: eventMap[payload.event_id] || payload.event_title || '' })}
          columns={[
            { key: 'event_title', label: 'Evento', render: (row) => row.event_title || eventMap[row.event_id] || '—' },
            { key: 'name', label: 'Lote' },
            {
              key: 'price',
              label: 'Preço',
              render: (row) => (row.is_free ? 'Gratuito' : formatCurrency(row.price)),
            },
            {
              key: 'quantity_total',
              label: 'Vendidos / total',
              render: (row) => `${row.quantity_sold || 0} / ${row.quantity_total || '∞'}`,
            },
            {
              key: 'sales',
              label: 'Vendas',
              render: (row) =>
                row.sales_start || row.sales_end
                  ? `${formatDate(row.sales_start)} — ${formatDate(row.sales_end)}`
                  : 'Sem prazo definido',
            },
            {
              key: 'rotation_mode',
              label: 'Virada',
              render: (row) => {
                const labels = { sold_out: 'Esgotar', date: 'Por data', both: 'Ambos', manual: 'Manual' };
                return labels[row.rotation_mode] || 'Esgotar';
              },
            },
            { key: 'active', label: 'Ativo', render: (row) => (row.active ? 'Sim' : 'Não') },
          ]}
          fields={[
            { name: 'event_id', label: 'Evento', type: 'relation', options: eventOptions, required: true, colSpan: 2 },
            { name: 'name', label: 'Nome do lote', required: true, placeholder: 'Ex.: 1º lote, VIP, Meia' },
            { name: 'price', label: 'Preço (R$)', type: 'number', step: 0.01 },
            { name: 'is_free', label: 'Lote gratuito', type: 'switch' },
            { name: 'max_per_buyer', label: 'Limite por comprador', type: 'number' },
            { name: 'quantity_total', label: 'Quantidade disponível', type: 'number', help: 'Deixe 0 para não limitar.' },
            { name: 'quantity_sold', label: 'Quantidade já vendida', type: 'number' },
            { name: 'sales_start', label: 'Início das vendas', type: 'date' },
            { name: 'sales_end', label: 'Encerramento das vendas', type: 'date' },
            {
              name: 'rotation_mode',
              label: 'Virada automática de lote',
              type: 'select',
              options: ROTATION_MODE,
              help: 'Define quando este lote desativa e o próximo lote assume automaticamente.',
            },
            {
              name: 'next_batch_id',
              label: 'Próximo lote (virada automática)',
              type: 'relation',
              options: batchOptions,
              help: 'Lote que entra no ar quando este se esgota ou a data de venda chega ao fim.',
            },
            { name: 'description', label: 'Descrição do lote', colSpan: 2 },
            { name: 'order', label: 'Ordem', type: 'number' },
            { name: 'active', label: 'Ativo', type: 'switch' },
          ]}
        />
      </TabsContent>

      <TabsContent value="categorias" className="mt-8">
        <EntityManager
          title="Categorias de eventos"
          subtitle="As categorias criadas aqui aparecem como filtros na página pública de eventos."
          entity="EventCategory"
          sort="order"
          defaults={{ active: true, color: '#6B16C5' }}
          columns={[
            { key: 'name', label: 'Categoria' },
            { key: 'order', label: 'Ordem' },
            { key: 'active', label: 'Ativa', render: (row) => (row.active ? 'Sim' : 'Não') },
          ]}
          fields={[
            { name: 'name', label: 'Nome', required: true },
            { name: 'color', label: 'Cor' },
            { name: 'order', label: 'Ordem', type: 'number' },
            { name: 'active', label: 'Ativa', type: 'switch' },
          ]}
        />
      </TabsContent>
    </Tabs>
  );
}