import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from '@/lib/router-compat';
import { Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHero from '@/components/site/PageHero';
import EmptyState from '@/components/site/EmptyState';
import EventCard from '@/components/site/EventCard';
import ProductCard from '@/components/site/ProductCard';
import usePageMeta from '@/hooks/usePageMeta';
import { formatDate } from '@/lib/format';

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function Busca() {
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') || '');
  const [results, setResults] = useState({ events: [], posts: [], products: [], sports: [], pages: [] });
  const [loading, setLoading] = useState(false);
  const query = params.get('q') || '';

  usePageMeta('Busca', 'Busque eventos, notícias, produtos, modalidades e páginas do site da atlética.');

  useEffect(() => {
    if (!query) {
      setResults({ events: [], posts: [], products: [], sports: [], pages: [] });
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      const pattern = escapeRegex(query);
      const regex = { $regex: pattern, $options: 'i' };
      const settled = await Promise.allSettled([
        base44.entities.Event.filter({ status: { $ne: 'draft' }, title: regex }, { sort: '-start_date', limit: 12 }),
        base44.entities.Post.filter({ status: 'published', title: regex }, { sort: '-published_date', limit: 12 }),
        base44.entities.Product.filter({ status: 'published', name: regex }, { sort: 'order', limit: 12 }),
        base44.entities.Sport.filter({ active: true, name: regex }, { sort: 'order', limit: 12 }),
        base44.entities.StaticPage.filter({ status: 'published', title: regex }, { sort: 'order', limit: 12 }),
      ]);
      if (!active) return;
      const pick = (index) => (settled[index].status === 'fulfilled' ? settled[index].value?.items || [] : []);
      setResults({
        events: pick(0),
        posts: pick(1),
        products: pick(2),
        sports: pick(3),
        pages: pick(4),
      });
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [query]);

  const total = Object.values(results).reduce((sum, list) => sum + list.length, 0);

  return (
    <div>
      <PageHero
        eyebrow="Busca interna"
        title="O que você procura?"
        subtitle="Encontre eventos, notícias, produtos, modalidades esportivas e páginas institucionais."
      />

      <section className="site-container py-12">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setParams(term.trim() ? { q: term.trim() } : {});
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Digite uma palavra-chave"
              aria-label="Termo de busca"
              className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm text-brand-deep"
            />
          </div>
          <button
            type="submit"
            className="h-12 rounded-full bg-brand-primary px-8 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
          >
            Buscar
          </button>
        </form>

        {query && !loading && (
          <p className="mt-6 text-sm text-slate-500">
            {total} resultado(s) para <span className="font-medium text-brand-deep">“{query}”</span>
          </p>
        )}

        {loading && <p className="mt-6 text-sm text-slate-500">Buscando…</p>}

        {!loading && query && total === 0 && (
          <div className="mt-8">
            <EmptyState
              title="Nenhum resultado encontrado"
              message="Tente outras palavras ou navegue pelas seções do site."
              actionLabel="Ver eventos"
              actionTo="/eventos"
            />
          </div>
        )}

        {!loading && results.events.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Eventos</h2>
            <div className="gavel-rule mt-3" />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {!loading && results.posts.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Notícias e comunicados</h2>
            <div className="gavel-rule mt-3" />
            <div className="mt-6 space-y-3">
              {results.posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/noticias/${post.id}`}
                  className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-primary/40 sm:flex-row sm:items-center"
                >
                  <span className="font-heading text-sm uppercase tracking-tight text-brand-deep">{post.title}</span>
                  <span className="font-mono text-xs text-slate-400">
                    {formatDate(post.published_date || post.created_date)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && results.products.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Produtos</h2>
            <div className="gavel-rule mt-3" />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {results.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {!loading && (results.sports.length > 0 || results.pages.length > 0) && (
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            {results.sports.length > 0 && (
              <div>
                <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Modalidades</h2>
                <div className="gavel-rule mt-3" />
                <div className="mt-5 space-y-3">
                  {results.sports.map((sport) => (
                    <Link
                      key={sport.id}
                      to={`/esportes/${sport.id}`}
                      className="block rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-brand-deep hover:border-brand-primary/40"
                    >
                      {sport.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {results.pages.length > 0 && (
              <div>
                <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Páginas</h2>
                <div className="gavel-rule mt-3" />
                <div className="mt-5 space-y-3">
                  {results.pages.map((page) => (
                    <Link
                      key={page.id}
                      to={`/pagina/${page.slug}`}
                      className="block rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-brand-deep hover:border-brand-primary/40"
                    >
                      {page.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}