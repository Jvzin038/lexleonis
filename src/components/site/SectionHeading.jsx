import React from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowRight } from 'lucide-react';

export default function SectionHeading({ eyebrow, title, subtitle, linkTo, linkLabel, align = 'left', light = false }) {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start';
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${align === 'center' ? 'sm:flex-col sm:items-center' : ''}`}>
      <div className={`flex max-w-2xl flex-col gap-3 ${alignment}`}>
        {eyebrow && (
          <span className={`font-heading text-xs uppercase tracking-[0.28em] ${light ? 'text-brand-gold' : 'text-brand-primary'}`}>
            {eyebrow}
          </span>
        )}
        <h2 className={`fluid-h2 font-heading uppercase leading-tight tracking-tight ${light ? 'text-white' : 'text-brand-deep'}`}>
          {title}
        </h2>
        <div className="gavel-rule" />
        {subtitle && <p className={`text-base leading-relaxed ${light ? 'text-white/75' : 'text-slate-600'}`}>{subtitle}</p>}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className={`group inline-flex shrink-0 items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] transition-colors ${
            light ? 'text-brand-gold hover:text-white' : 'text-brand-primary hover:text-brand-deep'
          }`}
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}