import React from 'react';
import { Image } from '@/components/ui/image';

export default function PageHero({ eyebrow, title, subtitle, imageUrl, children }) {
  return (
    <section className="relative overflow-hidden bg-brand-deep text-white">
      {imageUrl && (
        <>
          <Image src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-brand-deep/85" />
        </>
      )}
      <div className="absolute -right-24 top-1/2 hidden h-72 w-72 -translate-y-1/2 rounded-full border border-brand-gold/20 lg:block" />
      <div className="site-container relative py-14 sm:py-20">
        {eyebrow && (
          <span className="font-heading text-xs uppercase tracking-[0.3em] text-brand-gold">{eyebrow}</span>
        )}
        <h1 className="fluid-h1 mt-4 max-w-4xl font-heading uppercase leading-[1.08] tracking-tight">
          {title}
        </h1>
        <div className="gavel-rule mt-6" />
        {subtitle && <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75">{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}