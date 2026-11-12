import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { formatDate } from '@/lib/format';

export default function PostCard({ post, variant = 'default' }) {
  const isFeatured = variant === 'featured';

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${
        isFeatured ? 'lg:flex-row' : ''
      }`}
    >
      <Link
        to={`/noticias/${post.id}`}
        className={`block overflow-hidden bg-brand-soft ${isFeatured ? 'lg:w-1/2' : ''} ${
          isFeatured ? 'aspect-[16/10] lg:aspect-auto' : 'aspect-[16/10]'
        }`}
      >
        {post.cover_url ? (
          <Image
            src={post.cover_url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-deep">
            <span className="font-heading text-xs uppercase tracking-[0.3em] text-brand-gold">
              {post.category || 'Comunicado'}
            </span>
          </div>
        )}
      </Link>

      <div className={`flex flex-1 flex-col p-5 ${isFeatured ? 'lg:justify-center lg:p-8' : ''}`}>
        <div className="flex flex-wrap items-center gap-3 text-[0.7rem] uppercase tracking-[0.16em]">
          <span className="font-semibold text-brand-primary">{post.type === 'announcement' ? 'Comunicado' : post.category || 'Notícia'}</span>
          <span className="font-mono text-slate-400">{formatDate(post.published_date || post.created_date)}</span>
        </div>

        <h3
          className={`mt-3 font-heading uppercase leading-snug tracking-tight text-brand-deep group-hover:text-brand-primary ${
            isFeatured ? 'text-xl sm:text-2xl' : 'text-lg'
          }`}
        >
          <Link to={`/noticias/${post.id}`}>{post.title}</Link>
        </h3>

        {(post.subtitle || post.content) && (
          <p className={`mt-3 text-sm leading-relaxed text-slate-600 ${isFeatured ? 'line-clamp-4' : 'line-clamp-3'}`}>
            {post.subtitle || post.content}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-slate-400">{post.author || 'Diretoria Lex Leonis'}</span>
          <Link
            to={`/noticias/${post.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-deep"
          >
            Ler mais <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}