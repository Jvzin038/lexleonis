import React from 'react';
import { Link } from '@/lib/router-compat';
import { Handshake } from 'lucide-react';
import PageHero from '@/components/site/PageHero';
import SponsorGrid from '@/components/site/SponsorGrid';
import EmptyState from '@/components/site/EmptyState';
import useCollection from '@/hooks/useCollection';
import usePageMeta from '@/hooks/usePageMeta';

const TIERS = [
  { key: 'principal', label: 'Patrocinador principal', description: 'Cota máster com maior visibilidade nas ações da atlética.' },
  { key: 'apoio', label: 'Apoio', description: 'Empresas que apoiam os eventos e as equipes da atlética.' },
  { key: 'parceiro', label: 'Parceiro', description: 'Parceiros comerciais com benefícios para os alunos.' },
];

export default function Patrocinadores() {
  usePageMeta('Patrocinadores e benefícios', 'Parceiros, apoiadores e benefícios oferecidos aos alunos da Lex Leonis.');
  const { items, loading } = useCollection('Sponsor', { active: true }, { sort: 'order', limit: 100 });

  const grouped = TIERS.map((tier) => ({
    ...tier,
    sponsors: items.filter((sponsor) => (sponsor.tier || 'apoio') === tier.key),
  }));

  return (
    <div>
      <PageHero
        eyebrow="Parcerias"
        title="Patrocinadores e benefícios"
        subtitle="Empresas que acreditam na atlética e oferecem vantagens exclusivas para os alunos do curso de Direito."
      >
        <Link
          to="/seja-patrocinador"
          className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-ink"
        >
          <Handshake className="h-4 w-4" /> Quero ser patrocinador
        </Link>
      </PageHero>

      <section className="site-container py-12">
        {loading && <p className="text-sm text-slate-500">Carregando parceiros…</p>}

        {!loading && items.length === 0 && (
          <EmptyState
            title="Nenhum parceiro publicado"
            message="As marcas parceiras da atlética aparecem aqui assim que forem cadastradas."
            actionLabel="Ver cotas de patrocínio"
            actionTo="/seja-patrocinador"
          />
        )}

        {!loading &&
          grouped.map(
            (tier) =>
              tier.sponsors.length > 0 && (
                <div key={tier.key} className="mb-14">
                  <h2 className="font-heading text-xl uppercase tracking-tight text-brand-deep">{tier.label}</h2>
                  <div className="gavel-rule mt-3" />
                  <p className="mt-3 max-w-2xl text-sm text-slate-500">{tier.description}</p>
                  <div className="mt-7">
                    <SponsorGrid sponsors={tier.sponsors} />
                  </div>
                </div>
              ),
          )}

        <div className="mt-6 rounded-2xl bg-brand-deep p-8 text-white sm:p-12">
          <h2 className="font-heading text-2xl uppercase tracking-tight">
            Benefícios exclusivos para alunos da Lex Leonis
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/75">
            Os parceiros da atlética oferecem descontos, condições especiais e vantagens em produtos e serviços. Os
            códigos promocionais publicados podem ser usados mediante apresentação da carteirinha de associado ou do
            e-mail acadêmico, conforme as regras de cada parceiro.
          </p>
        </div>
      </section>
    </div>
  );
}