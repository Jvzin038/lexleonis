import React, { useEffect, useState } from 'react';
import { Link, useParams } from '@/lib/router-compat';
import { ArrowLeft, CalendarDays, UserRound } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import PageHero from '@/components/site/PageHero';
import EmptyState from '@/components/site/EmptyState';
import usePageMeta from '@/hooks/usePageMeta';
import { formatDate } from '@/lib/format';

export default function NoticiaDetalhe() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  usePageMeta(post?.title, post?.subtitle);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const found = await base44.entities.Post.get(id);
        if (!active) return;
        setPost(found);
        const page = await base44.entities.Post.filter(
          { status: 'published', type: found.type },
          { sort: '-published_date', limit: 4 },
        );
        if (active) setRelated((page?.items || []).filter((item) => item.id !== id).slice(0, 3));
      } catch (error) {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="site-container py-24 text-center">
        <h1 className="font-heading text-2xl uppercase text-brand-deep">Publicação não encontrada</h1>
        <Link
          to="/noticias"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-deep px-6 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para notícias
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow={post.type === 'announcement' ? 'Comunicado' : post.category || 'Notícia'}
        title={post.title}
        subtitle={post.subtitle}
        imageUrl={post.cover_url}
      />

      <section className="site-container py-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-5 border-b border-slate-200 pb-5 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-brand-primary" />
              {formatDate(post.published_date || post.created_date)}
            </span>
            <span className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-brand-primary" />
              {post.author || 'Diretoria Lex Leonis'}
            </span>
          </div>

          {post.cover_url && (
            <Image src={post.cover_url} alt={post.title} className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" />
          )}

          <div className="site-prose mt-8 text-slate-700">
            {String(post.content || '')
              .split('\n')
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Outras publicações</h2>
            <div className="gavel-rule mt-3" />
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/noticias/${item.id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-primary/40"
                >
                  <p className="font-mono text-xs text-slate-400">
                    {formatDate(item.published_date || item.created_date)}
                  </p>
                  <p className="mt-2 font-heading text-sm uppercase tracking-tight text-brand-deep">{item.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <EmptyState
            title="Acompanhe a atlética"
            message="Veja a galeria de momentos e o calendário completo de eventos e jogos."
            actionLabel="Ver momentos"
            actionTo="/momentos"
          />
        </div>
      </section>
    </div>
  );
}