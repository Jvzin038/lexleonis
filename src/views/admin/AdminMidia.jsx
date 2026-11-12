import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import EntityManager from '@/components/admin/EntityManager';
import { Image } from '@/components/ui/image';

export default function AdminMidia() {
  return (
    <EntityManager
      title="Biblioteca de mídia"
      subtitle="Centralize as imagens e arquivos do site. Use o campo “Onde é usado” para registrar em quais páginas cada arquivo aparece antes de excluir."
      entity="MediaFile"
      sort="-created_date"
      searchField="name"
      defaults={{ file_type: 'image' }}
      columns={[
        {
          key: 'url',
          label: 'Prévia',
          render: (row) =>
            row.file_type === 'image' && row.url ? (
              <Image src={row.url} alt={row.name || ''} className="h-12 w-16 rounded object-cover" />
            ) : (
              <span className="flex h-12 w-16 items-center justify-center rounded bg-slate-100 text-slate-400">
                <ImageIcon className="h-4 w-4" />
              </span>
            ),
        },
        { key: 'name', label: 'Arquivo' },
        { key: 'category', label: 'Categoria' },
        { key: 'file_type', label: 'Tipo' },
        { key: 'used_in', label: 'Onde é usado' },
      ]}
      fields={[
        { name: 'url', label: 'Arquivo (imagem)', type: 'image', colSpan: 2, required: true },
        { name: 'name', label: 'Nome do arquivo', required: true },
        { name: 'category', label: 'Categoria', placeholder: 'Ex.: Eventos, Atletas, Produtos, Institucional' },
        { name: 'description', label: 'Descrição', type: 'textarea', colSpan: 2 },
        { name: 'used_in', label: 'Onde é usado', placeholder: 'Ex.: Banner da home, Álbum do evento, Loja' },
        { name: 'file_type', label: 'Tipo de arquivo', type: 'select', options: [{ value: 'image', label: 'Imagem' }, { value: 'document', label: 'Documento' }, { value: 'video', label: 'Vídeo' }, { value: 'other', label: 'Outro' }] },
      ]}
    />
  );
}