import React from 'react';
import { Link } from '@/lib/router-compat';
import { Image } from '@/components/ui/image';
import { formatCurrency } from '@/lib/format';

export default function ProductCard({ product }) {
  const price = Number(product.promo_price ?? product.price ?? 0);
  const hasPromo = product.promo_price != null && Number(product.promo_price) < Number(product.price || 0);
  const soldOut = !product.preorder && Number(product.stock || 0) <= 0;

  return (
    <article className="lift group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Link to={`/loja/${product.id}`} className="relative block aspect-square overflow-hidden bg-[#F4F4F6]">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-soft">
            <span className="font-heading text-xs uppercase tracking-[0.3em] text-brand-deep/40">Lex Leonis</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {hasPromo && (
            <span className="rounded-full bg-brand-gold px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-brand-ink">
              Promoção
            </span>
          )}
          {product.preorder && (
            <span className="rounded-full bg-brand-deep px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-brand-gold">
              Encomenda
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-slate-800 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white">
              Esgotado
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {product.category && (
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-primary">
            {product.category}
          </span>
        )}
        <h3 className="mt-2 font-heading text-base uppercase leading-snug tracking-tight text-brand-deep">
          <Link to={`/loja/${product.id}`} className="hover:text-brand-primary">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-semibold text-brand-deep">{formatCurrency(price)}</span>
            {hasPromo && (
              <span className="font-mono text-sm text-slate-400 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>
          <Link
            to={`/loja/${product.id}`}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-brand-deep px-4 py-2.5 text-sm font-semibold text-brand-deep transition-colors hover:bg-brand-deep hover:text-white"
          >
            {soldOut ? 'Ver produto' : 'Ver e encomendar'}
          </Link>
        </div>
      </div>
    </article>
  );
}