import React from 'react';
import { Inbox } from 'lucide-react';
import { Link } from '@/lib/router-compat';

export default function EmptyState({
  title = 'Nada publicado por aqui ainda',
  message = 'Assim que a diretoria publicar novidades, elas aparecem nesta área.',
  actionLabel,
  actionTo,
  light = false,
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center ${
        light ? 'border-white/20 text-white/70' : 'border-slate-300 bg-white text-slate-500'
      }`}
    >
      <Inbox className={`h-8 w-8 ${light ? 'text-brand-gold' : 'text-slate-400'}`} />
      <p className={`mt-4 font-heading text-sm uppercase tracking-[0.16em] ${light ? 'text-white' : 'text-brand-deep'}`}>
        {title}
      </p>
      <p className="mt-2 max-w-md text-sm">{message}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-6 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}