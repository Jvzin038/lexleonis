import React from 'react';
import EntityManager from '@/components/admin/EntityManager';
import StatusBadge from '@/components/site/StatusBadge';
import { formatDate } from '@/lib/format';

const TYPE_OPTIONS = [
  { value: 'news', label: 'Notícia' },
  { value: 'announcement', label: 'Comunicado' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
];

export default function AdminNoticias() {
  return (
    <EntityManager
      title="Notícias e comunicados"
      subtitle="Publique novidades, informes e avisos direcionados aos alunos. Publicações com status “Publicado” aparecem no site imediatamente."
      entity="Post"
      sort="-published_date"
      searchField="title"
      searchPlaceholder="Buscar por título…"
      allowDuplicate
      defaults={{ status: 'published', type: 'news', audience: 'all' }}
      columns={[
        { key: 'title', label: 'Título' },
        {
          key: 'type',
          label: 'Tipo',
          render: (row) => (row.type === 'announcement' ? 'Comunicado' : 'Notícia'),
        },
        { key: 'category', label: 'Categoria' },
        {
          key: 'published_date',
          label: 'Publicação',
          render: (row) => formatDate(row.published_date || row.created_date),
        },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge kind="post" value={row.status} /> },
        { key: 'featured', label: 'Destaque', render: (row) => (row.featured ? 'Sim' : '—') },
      ]}
      fields={[
        { name: 'title', label: 'Título', required: true, colSpan: 2 },
        { name: 'subtitle', label: 'Subtítulo', colSpan: 2 },
        { name: 'cover_url', label: 'Imagem de capa', type: 'image', colSpan: 2 },
        { name: 'category', label: 'Categoria', placeholder: 'Ex.: Diretoria, Esportes, Eventos' },
        { name: 'type', label: 'Tipo', type: 'select', options: TYPE_OPTIONS },
        { name: 'author', label: 'Autor / setor' },
        { name: 'published_date', label: 'Data de publicação', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
        { name: 'audience', label: 'Público', type: 'select', options: [{ value: 'all', label: 'Todos' }, { value: 'students', label: 'Somente alunos (área do aluno)' }] },
        { name: 'featured', label: 'Destacar na página inicial', type: 'switch' },
        { name: 'content', label: 'Conteúdo', type: 'textarea', rows: 10, colSpan: 2, required: true },
      ]}
    />
  );
}