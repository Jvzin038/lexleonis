import React from 'react';
import EntityManager from '@/components/admin/EntityManager';

export default function AdminDiretoria() {
  return (
    <EntityManager
      title="Diretoria e gestão"
      subtitle="Cadastre a diretoria atual, os cargos e departamentos. Use “Visível” para ocultar informações que não devem ser públicas."
      entity="BoardMember"
      sort="order"
      searchField="name"
      defaults={{ visible: true }}
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'role_title', label: 'Cargo' },
        { key: 'department', label: 'Departamento' },
        { key: 'email', label: 'E-mail' },
        { key: 'visible', label: 'Visível', render: (row) => (row.visible ? 'Sim' : 'Não') },
      ]}
      fields={[
        { name: 'name', label: 'Nome completo', required: true, colSpan: 2 },
        { name: 'role_title', label: 'Cargo', required: true },
        { name: 'department', label: 'Departamento / diretoria' },
        { name: 'photo_url', label: 'Foto', type: 'image', colSpan: 2 },
        { name: 'bio', label: 'Apresentação', type: 'textarea', colSpan: 2 },
        { name: 'email', label: 'E-mail de contato' },
        { name: 'instagram', label: 'Instagram' },
        { name: 'order', label: 'Ordem de exibição', type: 'number' },
        { name: 'visible', label: 'Visível no site', type: 'switch' },
      ]}
    />
  );
}