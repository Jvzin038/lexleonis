import React from 'react';
import { Link } from '@/lib/router-compat';
import { Images } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { formatDate } from '@/lib/format';

export default function AlbumCard({ album }) {
  return (
    <Link
      to={`/momentos/${album.id}`}
      className="lift group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-brand-deep"
    >
      {album.cover_url ? (
        <Image
          src={album.cover_url}
          alt={album.title}
          className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-brand-deep" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <span className="font-mono text-xs text-brand-gold">{formatDate(album.album_date || album.created_date)}</span>
        <h3 className="mt-1 font-heading text-lg uppercase leading-snug tracking-tight text-white">{album.title}</h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
          <Images className="h-3.5 w-3.5" />
          {album.photo_count ? `${album.photo_count} foto(s)` : 'Álbum de fotos'}
        </div>
      </div>
    </Link>
  );
}