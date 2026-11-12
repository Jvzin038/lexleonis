import React, { useEffect, useState } from 'react';
import { Link, useParams } from '@/lib/router-compat';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import PageHero from '@/components/site/PageHero';
import EmptyState from '@/components/site/EmptyState';
import usePageMeta from '@/hooks/usePageMeta';
import { formatDate } from '@/lib/format';

export default function AlbumDetalhe() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [current, setCurrent] = useState(-1);

  usePageMeta(album?.title, album?.description);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const found = await base44.entities.GalleryAlbum.get(id);
        if (!active) return;
        setAlbum(found);
        const page = await base44.entities.GalleryImage.filter({ album_id: id }, { sort: 'order', limit: 300 });
        if (active) setImages(page?.items || []);
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

  useEffect(() => {
    const onKey = (event) => {
      if (current < 0) return;
      if (event.key === 'Escape') setCurrent(-1);
      if (event.key === 'ArrowRight') setCurrent((value) => Math.min(images.length - 1, value + 1));
      if (event.key === 'ArrowLeft') setCurrent((value) => Math.max(0, value - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, images.length]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
      </div>
    );
  }

  if (notFound || !album) {
    return (
      <div className="site-container py-24 text-center">
        <h1 className="font-heading text-2xl uppercase text-brand-deep">Álbum não encontrado</h1>
        <Link
          to="/momentos"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-deep px-6 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para momentos
        </Link>
      </div>
    );
  }

  const active = current >= 0 ? images[current] : null;

  return (
    <div>
      <PageHero
        eyebrow={album.category || 'Galeria'}
        title={album.title}
        subtitle={album.description}
        imageUrl={album.cover_url}
      />

      <section className="site-container py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-sm text-slate-500">
            {formatDate(album.album_date || album.created_date)}
            {album.event_title ? ` • ${album.event_title}` : ''}
          </p>
          <p className="text-sm text-slate-500">{images.length} foto(s) neste álbum</p>
        </div>

        {images.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Álbum ainda sem fotos"
              message="As imagens deste álbum serão adicionadas pela equipe de comunicação."
            />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setCurrent(index)}
                className="group relative aspect-square overflow-hidden rounded-xl bg-brand-soft"
              >
                <Image
                  src={image.url}
                  alt={image.caption || `Foto ${index + 1} do álbum ${album.title}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {image.caption && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left text-xs text-white">
                    {image.caption}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {album.credit && <p className="mt-8 text-xs text-slate-400">Créditos: {album.credit}</p>}
      </section>

      {active && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 p-4 sm:p-8">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="font-heading text-sm uppercase tracking-[0.16em]">{album.title}</p>
              <p className="text-xs text-white/60">
                {current + 1} de {images.length}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrent(-1)}
              aria-label="Fechar visualização"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            <button
              type="button"
              onClick={() => setCurrent((value) => Math.max(0, value - 1))}
              disabled={current === 0}
              aria-label="Foto anterior"
              className="absolute left-0 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <Image
              src={active.url}
              alt={active.caption || 'Foto ampliada'}
              className="max-h-full max-w-full object-contain"
              fittingType="fit"
            />
            <button
              type="button"
              onClick={() => setCurrent((value) => Math.min(images.length - 1, value + 1))}
              disabled={current === images.length - 1}
              aria-label="Próxima foto"
              className="absolute right-0 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <p className="mx-auto max-w-3xl pb-2 text-center text-sm text-white/75">
            {active.caption || album.title}
            {active.credit ? ` — ${active.credit}` : ''}
          </p>
        </div>
      )}
    </div>
  );
}