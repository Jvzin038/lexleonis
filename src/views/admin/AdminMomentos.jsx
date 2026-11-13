import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import EntityManager from '@/components/admin/EntityManager';
import BulkPhotoUpload from '@/components/admin/BulkPhotoUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/format';

export default function AdminMomentos() {
  const [albums, setAlbums] = useState([]);
  const [photosVersion, setPhotosVersion] = useState(0);

  const loadAlbums = useCallback(async () => {
    const page = await base44.entities.GalleryAlbum.filter({}, { sort: '-album_date', limit: 200 });
    setAlbums(page?.items || []);
  }, []);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const albumOptions = albums.map((album) => ({ value: album.id, label: album.title }));
  const albumMap = albums.reduce((map, album) => ({ ...map, [album.id]: album }), {});

  const refreshPhotos = useCallback(() => setPhotosVersion((v) => v + 1), []);

  return (
    <Tabs defaultValue="albuns">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
        <TabsTrigger
          value="albuns"
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-deep data-[state=active]:border-brand-deep data-[state=active]:bg-brand-deep data-[state=active]:text-white"
        >
          Álbuns
        </TabsTrigger>
        <TabsTrigger
          value="fotos"
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-deep data-[state=active]:border-brand-deep data-[state=active]:bg-brand-deep data-[state=active]:text-white"
        >
          Fotos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="albuns" className="mt-8">
        <EntityManager
          title="Álbuns de momentos"
          subtitle="Crie álbuns por evento, escolha a capa e publique. Os álbuns publicados aparecem na página Momentos."
          entity="GalleryAlbum"
          sort="-album_date"
          searchField="title"
          defaults={{ published: true }}
          columns={[
            { key: 'title', label: 'Álbum' },
            { key: 'category', label: 'Categoria' },
            {
              key: 'album_date',
              label: 'Data',
              render: (row) => formatDate(row.album_date || row.created_date),
            },
            { key: 'photo_count', label: 'Fotos', render: (row) => row.photo_count || 0 },
            { key: 'published', label: 'Publicado', render: (row) => (row.published ? 'Sim' : 'Não') },
          ]}
          fields={[
            { name: 'title', label: 'Título do álbum', required: true, colSpan: 2 },
            { name: 'description', label: 'Descrição', type: 'textarea', colSpan: 2 },
            { name: 'cover_url', label: 'Capa', type: 'image', colSpan: 2 },
            { name: 'album_date', label: 'Data do álbum', type: 'date' },
            { name: 'category', label: 'Categoria', placeholder: 'Ex.: Festas, Jogos, Ações sociais' },
            { name: 'event_title', label: 'Evento relacionado', placeholder: 'Nome do evento' },
            { name: 'credit', label: 'Créditos das fotos', placeholder: 'Fotógrafo ou equipe' },
            { name: 'photo_count', label: 'Quantidade de fotos', type: 'number' },
            { name: 'order', label: 'Ordem de exibição', type: 'number' },
            { name: 'published', label: 'Publicar álbum no site', type: 'switch' },
          ]}
        />
      </TabsContent>

      <TabsContent value="fotos" className="mt-8 space-y-8">
        <BulkPhotoUpload albums={albums} onDone={refreshPhotos} />
        <EntityManager
          key={`photos-${photosVersion}`}
          title="Fotos enviadas"
          subtitle="Edite legendas, créditos e ordem, ou exclua fotos individuais."
          entity="GalleryImage"
          sort="order"
          columns={[
            {
              key: 'album_id',
              label: 'Álbum',
              render: (row) => albumMap[row.album_id]?.title || 'Álbum não encontrado',
            },
            { key: 'caption', label: 'Legenda' },
            { key: 'order', label: 'Ordem' },
          ]}
          fields={[
            { name: 'album_id', label: 'Álbum', type: 'relation', options: albumOptions, required: true },
            { name: 'order', label: 'Ordem', type: 'number' },
            { name: 'url', label: 'Foto', type: 'image', colSpan: 2, required: true },
            { name: 'caption', label: 'Legenda', colSpan: 2 },
            { name: 'credit', label: 'Crédito da foto', colSpan: 2 },
          ]}
        />
      </TabsContent>
    </Tabs>
  );
}