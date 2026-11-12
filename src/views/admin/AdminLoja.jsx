import React from 'react';
import EntityManager from '@/components/admin/EntityManager';
import StatusBadge from '@/components/site/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/format';

const TAB_CLASS =
  'rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-deep data-[state=active]:border-brand-deep data-[state=active]:bg-brand-deep data-[state=active]:text-white';

export default function AdminLoja() {
  return (
    <Tabs defaultValue="produtos">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
        <TabsTrigger value="produtos" className={TAB_CLASS}>
          Produtos
        </TabsTrigger>
        <TabsTrigger value="categorias" className={TAB_CLASS}>
          Categorias
        </TabsTrigger>
      </TabsList>

      <TabsContent value="produtos" className="mt-8">
        <EntityManager
          title="Produtos da loja"
          subtitle="Cadastre camisas, agasalhos, copos e itens de edição limitada. Produtos publicados aparecem na loja pública."
          entity="Product"
          sort="order"
          searchField="name"
          defaults={{ status: 'published', stock: 0, sizes: [], images: [], low_stock_alert: 5 }}
          columns={[
            { key: 'name', label: 'Produto' },
            { key: 'category', label: 'Categoria' },
            {
              key: 'price',
              label: 'Preço',
              render: (row) =>
                row.promo_price != null && Number(row.promo_price) < Number(row.price)
                  ? `${formatCurrency(row.promo_price)} (de ${formatCurrency(row.price)})`
                  : formatCurrency(row.price),
            },
            { key: 'stock', label: 'Estoque', render: (row) => (row.preorder ? 'Encomenda' : row.stock || 0) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge kind="product" value={row.status} /> },
          ]}
          fields={[
            { name: 'name', label: 'Nome do produto', required: true, colSpan: 2 },
            { name: 'category', label: 'Categoria', placeholder: 'Ex.: Camisas, Agasalhos, Copos' },
            { name: 'sku', label: 'Código interno (SKU)' },
            { name: 'description', label: 'Descrição', type: 'textarea', rows: 6, colSpan: 2 },
            { name: 'images', label: 'Imagens do produto', type: 'images', colSpan: 2 },
            { name: 'price', label: 'Preço (R$)', type: 'number', step: 0.01, required: true },
            { name: 'promo_price', label: 'Preço promocional (R$)', type: 'number', step: 0.01 },
            {
              name: 'sizes',
              label: 'Tamanhos disponíveis',
              type: 'choices',
              options: ['PP', 'P', 'M', 'G', 'GG', 'Baby Look'],
              help: 'Toque nos tamanhos que estarão disponíveis para esta peça.',
            },
            { name: 'stock', label: 'Estoque disponível', type: 'number' },
            { name: 'low_stock_alert', label: 'Avisar quando o estoque for menor ou igual a', type: 'number' },
            { name: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Rascunho' }, { value: 'published', label: 'Publicado' }, { value: 'archived', label: 'Arquivado' }] },
            { name: 'preorder', label: 'Produto por encomenda / pré-venda', type: 'switch' },
            { name: 'customizable', label: 'Camisa personalizável (número e nome do aluno)', type: 'switch' },
            { name: 'featured', label: 'Destacar na página inicial', type: 'switch' },
            { name: 'order', label: 'Ordem na vitrine', type: 'number' },
          ]}
        />
      </TabsContent>

      <TabsContent value="categorias" className="mt-8">
        <EntityManager
          title="Categorias de produtos"
          subtitle="Organize a vitrine da loja. As categorias criadas aqui aparecem como filtros no site."
          entity="ProductCategory"
          sort="order"
          defaults={{ active: true }}
          columns={[
            { key: 'name', label: 'Categoria' },
            { key: 'order', label: 'Ordem' },
            { key: 'active', label: 'Ativa', render: (row) => (row.active ? 'Sim' : 'Não') },
          ]}
          fields={[
            { name: 'name', label: 'Nome', required: true },
            { name: 'order', label: 'Ordem', type: 'number' },
            { name: 'active', label: 'Ativa', type: 'switch' },
          ]}
        />
      </TabsContent>
    </Tabs>
  );
}