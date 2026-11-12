import React from 'react';
import EntityManager from '@/components/admin/EntityManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TAB_CLASS =
  'rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-deep data-[state=active]:border-brand-deep data-[state=active]:bg-brand-deep data-[state=active]:text-white';

const LOCATION_OPTIONS = [
  { value: 'main', label: 'Menu principal' },
  { value: 'footer', label: 'Rodapé' },
  { value: 'student', label: 'Área do aluno' },
];

export default function AdminPaginas() {
  return (
    <Tabs defaultValue="paginas">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
        <TabsTrigger value="paginas" className={TAB_CLASS}>
          Páginas
        </TabsTrigger>
        <TabsTrigger value="menus" className={TAB_CLASS}>
          Menus
        </TabsTrigger>
        <TabsTrigger value="faq" className={TAB_CLASS}>
          Perguntas frequentes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="paginas" className="mt-8">
        <EntityManager
          title="Páginas institucionais"
          subtitle="Crie e edite páginas como política de privacidade, termos de uso e regulamentos. O endereço amigável define o link da página."
          entity="StaticPage"
          sort="order"
          searchField="title"
          defaults={{ status: 'published' }}
          columns={[
            { key: 'title', label: 'Título' },
            { key: 'slug', label: 'Endereço', render: (row) => `/pagina/${row.slug}` },
            { key: 'status', label: 'Status', render: (row) => (row.status === 'published' ? 'Publicada' : 'Rascunho') },
            { key: 'show_in_footer', label: 'No rodapé', render: (row) => (row.show_in_footer ? 'Sim' : 'Não') },
          ]}
          fields={[
            { name: 'title', label: 'Título', required: true },
            {
              name: 'slug',
              label: 'Endereço amigável',
              required: true,
              help: 'Use apenas letras, números e hífens. Ex.: politica-de-privacidade',
            },
            { name: 'excerpt', label: 'Resumo exibido no topo', colSpan: 2 },
            { name: 'cover_url', label: 'Imagem de capa', type: 'image', colSpan: 2 },
            { name: 'content', label: 'Conteúdo', type: 'textarea', rows: 14, colSpan: 2, required: true },
            { name: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Rascunho' }, { value: 'published', label: 'Publicada' }] },
            { name: 'order', label: 'Ordem', type: 'number' },
            { name: 'show_in_footer', label: 'Mostrar no rodapé', type: 'switch' },
            { name: 'seo_title', label: 'Título para buscadores' },
            { name: 'seo_description', label: 'Descrição para buscadores' },
          ]}
        />
      </TabsContent>

      <TabsContent value="menus" className="mt-8">
        <EntityManager
          title="Menus e links"
          subtitle="Crie, edite, oculte e reordene os itens de navegação do site. Links externos abrem em nova aba."
          entity="NavItem"
          sort="order"
          defaults={{ visible: true, location: 'main', external: false, highlight: false }}
          columns={[
            { key: 'label', label: 'Item' },
            { key: 'path', label: 'Destino' },
            {
              key: 'location',
              label: 'Onde aparece',
              render: (row) => LOCATION_OPTIONS.find((item) => item.value === row.location)?.label || '—',
            },
            { key: 'order', label: 'Ordem' },
            { key: 'visible', label: 'Visível', render: (row) => (row.visible ? 'Sim' : 'Não') },
          ]}
          fields={[
            { name: 'label', label: 'Nome do item', required: true },
            {
              name: 'path',
              label: 'Destino',
              required: true,
              help: 'Use caminhos internos como /eventos, /loja ou um link completo (https://…).',
            },
            { name: 'location', label: 'Onde aparece', type: 'select', options: LOCATION_OPTIONS },
            { name: 'order', label: 'Ordem', type: 'number' },
            { name: 'visible', label: 'Visível', type: 'switch' },
            { name: 'external', label: 'É um link externo', type: 'switch' },
            { name: 'highlight', label: 'Destacar item', type: 'switch' },
          ]}
        />
      </TabsContent>

      <TabsContent value="faq" className="mt-8">
        <EntityManager
          title="Perguntas frequentes"
          subtitle="Publique as dúvidas mais comuns da comunidade. As respostas aparecem na página pública de perguntas frequentes."
          entity="FaqItem"
          sort="order"
          defaults={{ active: true }}
          columns={[
            { key: 'question', label: 'Pergunta' },
            { key: 'category', label: 'Categoria' },
            { key: 'order', label: 'Ordem' },
            { key: 'active', label: 'Ativa', render: (row) => (row.active ? 'Sim' : 'Não') },
          ]}
          fields={[
            { name: 'question', label: 'Pergunta', required: true, colSpan: 2 },
            { name: 'answer', label: 'Resposta', type: 'textarea', rows: 6, colSpan: 2, required: true },
            { name: 'category', label: 'Categoria', placeholder: 'Ex.: Ingressos, Loja, Esportes' },
            { name: 'order', label: 'Ordem', type: 'number' },
            { name: 'active', label: 'Publicada', type: 'switch' },
          ]}
        />
      </TabsContent>
    </Tabs>
  );
}