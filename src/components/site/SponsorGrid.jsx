import React from 'react';
import { ExternalLink, Gift, Tag } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { formatDate } from '@/lib/format';

export default function SponsorGrid({ sponsors, light = false }) {
  if (!sponsors.length) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sponsors.map((sponsor) => (
        <div
          key={sponsor.id}
          className={`lift flex h-full flex-col rounded-2xl border p-6 ${
            light ? 'border-white/15 bg-white/5 text-white' : 'border-slate-200 bg-white'
          }`}
        >
          <div className={`flex h-20 items-center justify-center rounded-xl ${light ? 'bg-white/10' : 'bg-brand-soft'}`}>
            {sponsor.logo_url ? (
              <Image
                src={sponsor.logo_url}
                alt={sponsor.name}
                className="max-h-14 w-auto max-w-[80%] object-contain"
                fittingType="fit"
              />
            ) : (
              <span className="font-heading text-sm uppercase tracking-[0.2em] text-brand-primary">
                {sponsor.name}
              </span>
            )}
          </div>

          <h3 className={`mt-5 font-heading text-base uppercase tracking-tight ${light ? 'text-white' : 'text-brand-deep'}`}>
            {sponsor.name}
          </h3>
          {sponsor.category && (
            <span className={`text-[0.7rem] uppercase tracking-[0.16em] ${light ? 'text-brand-gold' : 'text-brand-primary'}`}>
              {sponsor.category}
            </span>
          )}
          {sponsor.description && (
            <p className={`mt-3 text-sm leading-relaxed ${light ? 'text-white/70' : 'text-slate-600'}`}>
              {sponsor.description}
            </p>
          )}

          {sponsor.benefit && (
            <p className={`mt-4 flex items-start gap-2 text-sm ${light ? 'text-white/85' : 'text-slate-700'}`}>
              <Gift className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
              <span>{sponsor.benefit}</span>
            </p>
          )}

          {sponsor.promo_code && (
            <p
              className={`mt-2 flex items-center gap-2 font-mono text-sm ${
                light ? 'text-brand-gold' : 'text-brand-primary'
              }`}
            >
              <Tag className="h-4 w-4" /> {sponsor.promo_code}
            </p>
          )}

          {sponsor.valid_until && (
            <p className={`mt-1 text-xs ${light ? 'text-white/50' : 'text-slate-400'}`}>
              Válido até {formatDate(sponsor.valid_until)}
            </p>
          )}

          {sponsor.website_url && (
            <a
              href={sponsor.website_url}
              target="_blank"
              rel="noreferrer"
              className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${
                light ? 'text-brand-gold hover:text-white' : 'text-brand-primary hover:text-brand-deep'
              }`}
            >
              Visitar parceiro <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}