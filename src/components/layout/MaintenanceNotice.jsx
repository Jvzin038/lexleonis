import React from 'react';
import { Link } from '@/lib/router-compat';
import { Wrench } from 'lucide-react';
import { useSite } from '@/lib/site';

export default function MaintenanceNotice() {
  const { settings } = useSite();

  return (
    <section className="flex min-h-[70vh] items-center bg-brand-deep text-white">
      <div className="site-container max-w-2xl py-24 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-gold/50 text-brand-gold">
          <Wrench className="h-7 w-7" />
        </span>
        <h1 className="mt-8 font-heading text-3xl uppercase tracking-tight sm:text-4xl">
          {settings.maintenance_title || 'Estamos preparando algo novo'}
        </h1>
        <div className="gavel-rule mx-auto mt-6" />
        <p className="mt-6 text-base leading-relaxed text-white/75">
          {settings.maintenance_message ||
            'O site está temporariamente em manutenção. Voltamos em breve com novidades.'}
        </p>
        <Link
          to="/painel/entrar"
          className="mt-8 inline-flex rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
        >
          Acesso da diretoria
        </Link>
      </div>
    </section>
  );
}