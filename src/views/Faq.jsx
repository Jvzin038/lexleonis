import React, { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PageHero from '@/components/site/PageHero';
import EmptyState from '@/components/site/EmptyState';
import useCollection from '@/hooks/useCollection';
import usePageMeta from '@/hooks/usePageMeta';

export default function Faq() {
  usePageMeta('Perguntas frequentes', 'Dúvidas frequentes sobre eventos, ingressos, loja e esportes da Lex Leonis.');
  const { items, loading } = useCollection('FaqItem', { active: true }, { sort: 'order', limit: 100 });

  const grouped = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      const key = item.category || 'Geral';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return Array.from(map.entries());
  }, [items]);

  return (
    <div>
      <PageHero
        eyebrow="Ajuda"
        title="Perguntas frequentes"
        subtitle="Como comprar ingressos, participar de eventos, encomendar produtos e acompanhar as modalidades esportivas."
      />

      <section className="site-container py-14">
        {loading && <p className="text-sm text-slate-500">Carregando perguntas…</p>}

        {!loading && grouped.length === 0 && (
          <EmptyState
            title="Nenhuma pergunta publicada"
            message="A diretoria publica aqui as dúvidas mais frequentes da comunidade."
            actionLabel="Falar com a atlética"
            actionTo="/contato"
          />
        )}

        {!loading &&
          grouped.map(([category, entries]) => (
            <div key={category} className="mb-12">
              <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">{category}</h2>
              <div className="gavel-rule mt-3" />
              <Accordion type="single" collapsible className="mt-5">
                {entries.map((entry) => (
                  <AccordionItem key={entry.id} value={entry.id} className="border-slate-200">
                    <AccordionTrigger className="text-left font-medium text-brand-deep hover:no-underline">
                      {entry.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-slate-600">
                      {entry.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
      </section>
    </div>
  );
}