import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight, Ticket } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function HeroSection({ section, settings }) {
  const hasImage = Boolean(section.image_url);

  return (
    <section className="relative isolate overflow-hidden bg-brand-deep text-white">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
        {hasImage ? (
          <Image
            src={section.image_url}
            alt=""
            className="h-full w-full rounded-l-[6rem] object-cover"
            focalPointX={0.55}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-l-[6rem] bg-brand-primary/25">
            {settings.logo_url ? (
              <Image
                src={settings.logo_url}
                alt={`Logo da ${settings.site_name}`}
                className="max-h-[55%] w-auto max-w-[60%] object-contain opacity-90"
                fittingType="fit"
              />
            ) : (
              <span className="font-heading text-[8rem] uppercase leading-none tracking-tighter text-brand-gold/25">
                LL
              </span>
            )}
          </div>
        )}
        <div className="absolute inset-0 rounded-l-[6rem] bg-gradient-to-r from-brand-deep via-brand-deep/45 to-transparent" />
      </div>

      <div className="site-container relative flex items-center py-14 sm:min-h-[78vh] sm:py-20">
        <div className="max-w-2xl animate-brand-fade-up">
          <span className="inline-flex items-center gap-3 font-heading text-xs uppercase tracking-[0.32em] text-brand-gold">
            <span className="h-px w-10 bg-brand-gold" />
            {settings.short_name || 'Lex Leonis'}
          </span>
          <h1 className="fluid-h1 mt-6 font-heading uppercase leading-[1.02] tracking-tight">
            {section.title}
          </h1>
          {section.subtitle && (
            <p className="fluid-lead mt-6 max-w-xl leading-relaxed text-white/80">{section.subtitle}</p>
          )}
          <div className="mt-9 flex flex-wrap gap-3">
            {(section.cta_label || true) && (
              <Link
                to={section.cta_url || '/eventos'}
                className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-7 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-brand-ink transition-transform hover:scale-[1.03]"
              >
                <Ticket className="h-4 w-4" />
                {section.cta_label || 'Ver eventos e ingressos'}
              </Link>
            )}
            {section.secondary_label && (
              <Link
                to={section.secondary_url || '/atletica'}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                {section.secondary_label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {hasImage && (
        <div className="relative -mt-2 block lg:hidden">
          <Image src={section.image_url} alt="" className="h-64 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-deep to-transparent" />
        </div>
      )}
    </section>
  );
}