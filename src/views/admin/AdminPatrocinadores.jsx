import React from 'react';
import EntityManager from '@/components/admin/EntityManager';
import { formatDate } from '@/lib/format';

export default function AdminPatrocinadores() {
  return (
    <EntityManager
      title="Patrocinadores e parceiros"
      subtitle="Cadastre marcas parceiras, os benefícios oferecidos aos alunos e o código promocional de cada uma."
      entity="Sponsor"
      sort="order"
      searchField="name"
      defaults={{ active: true, tier: 'apoio' }}
      columns={[
        { key: 'name', label: 'Parceiro' },
        { key: 'tier', label: 'Cota' },
        { key: 'category', label: 'Segmento' },
        { key: 'promo_code', label: 'Código' },
        { key: 'valid_until', label: 'Válido até', render: (row) => (row.valid_until ? formatDate(row.valid_until) : '—') },
        { key: 'active', label: 'Ativo', render: (row) => (row.active ? 'Sim' : 'Não') },
      ]}
      fields={[
        { name: 'name', label: 'Nome do parceiro', required: true, colSpan: 2 },
        { name: 'logo_url', label: 'Logotipo', type: 'image', colSpan: 2 },
        { name: 'description', label: 'Descrição', type: 'textarea', colSpan: 2 },
        { name: 'category', label: 'Segmento', placeholder: 'Ex.: Alimentação, Vestuário, Serviços' },
        { name: 'tier', label: 'Cota', type: 'select', options: [{ value: 'principal', label: 'Patrocinador principal' }, { value: 'apoio', label: 'Apoio' }, { value: 'parceiro', label: 'Parceiro' }] },
        { name: 'benefit', label: 'Benefício para os alunos', type: 'textarea', colSpan: 2 },
        { name: 'promo_code', label: 'Código promocional' },
        { name: 'valid_until', label: 'Válido até', type: 'date' },
        { name: 'website_url', label: 'Site / rede social', colSpan: 2 },
        { name: 'contact_name', label: 'Contato — nome' },
        { name: 'contact_email', label: 'Contato — e-mail' },
        { name: 'contact_phone', label: 'Contato — telefone' },
        { name: 'order', label: 'Ordem de exibição', type: 'number' },
        { name: 'active', label: 'Exibir no site', type: 'switch' },
      ]}
    />
  );
}