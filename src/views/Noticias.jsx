import React, { useMemo, useState } from 'react';
import PageHero from '@/components/site/PageHero';
import PostCard from '@/components/site/PostCard';
import EmptyState from '@/components/site/EmptyState';
import useCollection from '@/hooks/useCollection';
import usePageMeta from '@/hooks/usePageMeta';

const TYPES = [
  { key: 'all', label: 'Tudo' },
  { key: 'news', label: 'Notícias' },
  { key: 'announcement', label: 'Comunicados' },
];

export default function Noticias() {
  usePageMeta('Notícias e comunicados', 'Publicações oficiais da Atlética Lex Leonis.');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');

  const query = useMemo(() => {
    const base = { status: 'published' };
    if (type !== 'all') base.type = type;
    if (category !== 'all') base.category = category;
    return base;
  }, [type, category]);

  const { items, loading } = useCollection('Post', query, { sort: '-published_date', limit: 60 });
  const { items: all } = useCollection('Post', { status: 'published' }, { sort: '-published_date', limit: 100 });

  const categories = useMemo(() => {
    const set = new Set();
    all.forEach((post) => post.category && set.add(post.category));
    return Array.from(set);
  }, [all]);

  const featured = items.find((post) => post.featured);
  const rest = featured ? items.filter((post) => post.id !== featured.id) : items;

  return (
    <div>
      <PageHero
        eyebrow="Comunicação oficial"
        title="Notícias e comunicados"
        subtitle="Informes da diretoria, novidades dos eventos, resultados esportivos e tudo o que acontece na atlética."
      />

      <section className="site-container py-12">
        <div className="flex flex-wrap gap-3">
          {TYPES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setType(item.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                type === item.key ? 'bg-brand-deep text-white' : 'bg-brand-soft text-brand-deep'
              }`}
            >
              {item.label}
            </button>
          ))}
          {categories.length > 0 && (
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-brand-deep"
              aria-label="Filtrar por categoria"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading && <p className="mt-8 text-sm text-slate-500">Carregando publicações…</p>}

        {!loading && items.length === 0 && (
          <div className="mt-8">
            <EmptyState
              title="Nenhuma publicação encontrada"
              message="Ajuste os filtros ou volte em breve — a diretoria publica novidades regularmente."
            />
          </div>
        )}

        {!loading && featured && (
          <div className="mt-8">
            <PostCard post={featured} variant="featured" />
          </div>
        )}

        {!loading && rest.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}