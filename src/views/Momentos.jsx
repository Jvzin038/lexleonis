import React, { useMemo, useState } from 'react';
import PageHero from '@/components/site/PageHero';
import AlbumCard from '@/components/site/AlbumCard';
import EmptyState from '@/components/site/EmptyState';
import useCollection from '@/hooks/useCollection';
import usePageMeta from '@/hooks/usePageMeta';

export default function Momentos() {
  usePageMeta('Momentos', 'Galeria de fotos e vídeos da Atlética Lex Leonis organizada por evento e categoria.');

  const { items: albums, loading } = useCollection(
    'GalleryAlbum',
    { published: true },
    { sort: '-album_date', limit: 60 },
  );
  const [category, setCategory] = useState('all');
  const [year, setYear] = useState('all');

  const categories = useMemo(() => {
    const set = new Set();
    albums.forEach((album) => album.category && set.add(album.category));
    return Array.from(set);
  }, [albums]);

  const years = useMemo(() => {
    const set = new Set();
    albums.forEach((album) => {
      const source = album.album_date || album.created_date;
      if (source) set.add(String(source).slice(0, 4));
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [albums]);

  const filtered = albums.filter((album) => {
    const source = String(album.album_date || album.created_date || '');
    if (category !== 'all' && album.category !== category) return false;
    if (year !== 'all' && source.slice(0, 4) !== year) return false;
    return true;
  });

  return (
    <div>
      <PageHero
        eyebrow="Memória da atlética"
        title="Momentos"
        subtitle="Os registros dos nossos eventos, jogos, festas e ações — organizados por álbum, data e categoria."
      />

      <section className="site-container py-12">
        {(categories.length > 0 || years.length > 0) && (
          <div className="mb-8 flex flex-wrap gap-3">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-brand-deep"
              aria-label="Filtrar por categoria"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-brand-deep"
              aria-label="Filtrar por ano"
            >
              <option value="all">Todos os anos</option>
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading && <p className="text-sm text-slate-500">Carregando álbuns…</p>}

        {!loading && filtered.length === 0 && (
          <EmptyState
            title="Nenhum álbum publicado"
            message="Os álbuns de fotos aparecem aqui depois que a diretoria publica os registros do evento."
          />
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}