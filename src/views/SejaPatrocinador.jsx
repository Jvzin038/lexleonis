import React from 'react';
import { BadgeCheck, Megaphone, Store, Users } from 'lucide-react';
import PageHero from '@/components/site/PageHero';
import ContactForm from '@/components/site/ContactForm';
import { useSite } from '@/lib/site';
import usePageMeta from '@/hooks/usePageMeta';

const VALUE_POINTS = [
  {
    icon: Users,
    title: 'Público universitário qualificado',
    text: 'Alcance direto de estudantes do curso de Direito, professores e comunidade acadêmica.',
  },
  {
    icon: Megaphone,
    title: 'Visibilidade nas ações',
    text: 'Presença da marca nos eventos, uniformes, materiais de divulgação e canais oficiais da atlética.',
  },
  {
    icon: Store,
    title: 'Benefício para os alunos',
    text: 'Sua oferta divulgada como vantagem exclusiva aos associados da atlética.',
  },
  {
    icon: BadgeCheck,
    title: 'Associação à tradição',
    text: 'Apoio a uma atlética acadêmica com identidade forte e presença nos campeonatos universitários.',
  },
];

export default function SejaPatrocinador() {
  usePageMeta('Seja patrocinador', 'Cotas e oportunidades de patrocínio da Atlética Lex Leonis.');
  const { settings } = useSite();

  return (
    <div>
      <PageHero
        eyebrow="Parcerias comerciais"
        title="Seja patrocinador da Lex Leonis"
        subtitle="Conecte sua marca à atlética do curso de Direito e apoie o esporte universitário enquanto ganha visibilidade junto aos alunos."
      />

      <section className="site-container py-14">
        <div className="grid gap-6 sm:grid-cols-2">
          {VALUE_POINTS.map((point) => (
            <div key={point.title} className="rounded-2xl border border-slate-200 bg-white p-7">
              <point.icon className="h-6 w-6 text-brand-primary" />
              <h2 className="mt-4 font-heading text-base uppercase tracking-tight text-brand-deep">
                {point.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{point.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-brand-deep p-7 text-white">
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-brand-gold">Cota máster</p>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Visibilidade principal nos eventos, materiais e canais oficiais da atlética.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-7">
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-brand-primary">Cota de apoio</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Apoio aos eventos, equipes e ações sociais, com divulgação nos materiais da atlética.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-7">
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-brand-primary">Parceria de benefício</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Ofereça uma vantagem exclusiva aos alunos e apareça na área de benefícios da atlética.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="font-heading text-xl uppercase tracking-tight text-brand-deep">Vamos conversar</h2>
            <div className="gavel-rule mt-3" />
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Envie os dados da sua empresa e a diretoria entra em contato para apresentar as cotas completas, os
              valores e o que está incluído em cada pacote.
            </p>
            {settings.contact_email && (
              <p className="mt-4 text-sm text-slate-600">
                Contato comercial: <span className="font-medium text-brand-deep">{settings.contact_email}</span>
              </p>
            )}
          </div>
          <ContactForm type="sponsorship" submitLabel="Enviar interesse em patrocínio" />
        </div>
      </section>
    </div>
  );
}