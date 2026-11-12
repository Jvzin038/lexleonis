import React, { useEffect, useState } from 'react';
import { Link, useParams } from '@/lib/router-compat';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import PageHero from '@/components/site/PageHero';
import usePageMeta from '@/hooks/usePageMeta';

export default function Pagina() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  usePageMeta(page?.seo_title || page?.title, page?.seo_description || page?.excerpt);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await base44.entities.StaticPage.filter(
          { slug, status: 'published' },
          { limit: 1 },
        );
        const found = result?.items?.[0];
        if (!active) return;
        if (found) setPage(found);
        else setNotFound(true);
      } catch (error) {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="site-container py-24 text-center">
        <p className="font-heading text-sm uppercase tracking-[0.2em] text-brand-primary">Erro 404</p>
        <h1 className="mt-4 font-heading text-2xl uppercase text-brand-deep">Página não encontrada</h1>
        <p className="mt-3 text-sm text-slate-600">
          O endereço pode estar incorreto ou a página deixou de ser publicada.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-deep px-6 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Ir para a página inicial
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHero eyebrow="Institucional" title={page.title} subtitle={page.excerpt} imageUrl={page.cover_url} />
      <section className="site-container py-12">
        <div className="site-prose mx-auto max-w-3xl text-slate-700">
          {String(page.content || '')
            .split('\n')
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          {!page.content && (
            <p className="text-slate-500">
              O conteúdo desta página será publicado pela diretoria da atlética.
            </p>
          )}
        </div>
        {page.cover_url && (
          <Image
            src={page.cover_url}
            alt={page.title}
            className="mx-auto mt-10 max-h-[420px] w-full max-w-3xl rounded-2xl object-cover"
          />
        )}
      </section>
    </div>
  );
}