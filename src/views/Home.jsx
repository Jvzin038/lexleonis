import React from 'react';
import useHomeData from '@/hooks/useHomeData';
import usePageMeta from '@/hooks/usePageMeta';
import SectionRenderer from '@/components/site/SectionRenderer';
import HeroSection from '@/components/site/HeroSection';
import { useSite } from '@/lib/site';

export default function Home() {
  const data = useHomeData();
  const { settings } = useSite();
  usePageMeta(null, settings.seo_description);

  if (data.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-deep">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-brand-gold" />
      </div>
    );
  }

  if (data.sections.length === 0) {
    return (
      <HeroSection
        section={{
          title: settings.site_name || 'Atlética Lex Leonis',
          subtitle:
            settings.tagline ||
            'A atlética oficial do curso de Direito. Eventos, esportes, loja e tudo o que move a nossa comunidade acadêmica.',
          cta_label: 'Ver eventos e ingressos',
          cta_url: '/eventos',
          secondary_label: 'Conhecer a atlética',
          secondary_url: '/atletica',
        }}
        settings={settings}
      />
    );
  }

  return (
    <>
      {data.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} data={data} matches={data.matches} />
      ))}
    </>
  );
}