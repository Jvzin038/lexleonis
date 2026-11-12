import React from 'react';
import EntityManager from '@/components/admin/EntityManager';
import { formatDate } from '@/lib/format';

export default function AdminMensagens() {
  return (
    <EntityManager
      title="Mensagens de contato"
      subtitle="Mensagens enviadas pelo formulário de contato e pelas propostas de patrocínio."
      entity="ContactMessage"
      sort="-created_date"
      allowCreate={false}
      searchField="name"
      searchPlaceholder="Buscar por nome…"
      emptyMessage="Nenhuma mensagem recebida até agora."
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'email', label: 'E-mail' },
        { key: 'subject', label: 'Assunto' },
        {
          key: 'type',
          label: 'Origem',
          render: (row) => (row.type === 'sponsorship' ? 'Patrocínio' : 'Contato'),
        },
        { key: 'created_date', label: 'Recebida em', render: (row) => formatDate(row.created_date) },
        { key: 'status', label: 'Situação', render: (row) => row.status || 'new' },
      ]}
      fields={[
        { name: 'status', label: 'Situação', type: 'select', options: [{ value: 'new', label: 'Nova' }, { value: 'read', label: 'Lida' }, { value: 'answered', label: 'Respondida' }, { value: 'archived', label: 'Arquivada' }] },
        { name: 'admin_note', label: 'Anotação interna', type: 'textarea', colSpan: 2 },
      ]}
    />
  );
}