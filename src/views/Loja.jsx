import React, { useMemo, useState } from 'react';
import { Link } from '@/lib/router-compat';
import { ShoppingBag } from 'lucide-react';
import PageHero from '@/components/site/PageHero';
import ProductCard from '@/components/site/ProductCard';
import EmptyState from '@/components/site/EmptyState';
import useCollection from '@/hooks/useCollection';
import usePageMeta from '@/hooks/usePageMeta';
import { useCart } from '@/lib/cart';

export default function Loja() {
  usePageMeta('Loja oficial', 'Produtos oficiais da Atlética Lex Leonis.');
  const [category, setCategory] = useState('all');
  const { count } = useCart();

  const query = useMemo(() => {
    const base = { status: 'published' };
    if (category !== 'all') base.category = category;
    return base;
  }, [category]);

  const { items, loading } = useCollection('Product', query, { sort: 'order', limit: 80 });
  const { items: categories } = useCollection('ProductCategory', { active: true }, { sort: 'order', limit: 50 });

  return (
    <div>
      <PageHero
        eyebrow="Arsenal Lex"
        title="Loja oficial"
        subtitle="Camisas, agasalhos, copos, chaveiros e itens de edição limitada da atlética."
      >
        <Link
          to="/carrinho"
          className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-ink"
        >
          <ShoppingBag className="h-4 w-4" /> Meu carrinho {count > 0 ? `(${count})` : ''}
        </Link>
      </PageHero>

      <section className="site-container py-12">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === 'all' ? 'bg-brand-deep text-white' : 'bg-brand-soft text-brand-deep'
            }`}
          >
            Todos os produtos
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.name)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category === item.name ? 'bg-brand-deep text-white' : 'bg-brand-soft text-brand-deep'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {loading && <p className="mt-8 text-sm text-slate-500">Carregando produtos…</p>}

        {!loading && items.length === 0 && (
          <div className="mt-8">
            <EmptyState
              title="Nenhum produto publicado"
              message="Os produtos oficiais aparecem aqui assim que a diretoria publica a coleção."
            />
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}