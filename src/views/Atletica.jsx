import React from 'react';
import { Link } from '@/lib/router-compat';
import { Mail, MapPin, Phone, Scale, Shield, Sparkles, Target } from 'lucide-react';
import { Image } from '@/components/ui/image';
import PageHero from '@/components/site/PageHero';
import SectionHeading from '@/components/site/SectionHeading';
import EmptyState from '@/components/site/EmptyState';
import useCollection from '@/hooks/useCollection';
import usePageMeta from '@/hooks/usePageMeta';
import { useSite } from '@/lib/site';

function TextBlock({ icon: Icon, title, text }) {
  if (!text) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7">
      <Icon className="h-6 w-6 text-brand-primary" />
      <h3 className="mt-4 font-heading text-base uppercase tracking-tight text-brand-deep">{title}</h3>
      <div className="site-prose mt-3 text-sm text-slate-600">
        {String(text)
          .split('\n')
          .filter(Boolean)
          .map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
      </div>
    </div>
  );
}

export default function Atletica() {
  usePageMeta('A Atlética', 'História, missão, símbolos e diretoria da Atlética Lex Leonis.');
  const { settings } = useSite();
  const { items: members, loading } = useCollection('BoardMember', { visible: true }, { sort: 'order', limit: 100 });

  return (
    <div>
      <PageHero
        eyebrow="Institucional"
        title={`Sobre a ${settings.short_name || 'Lex Leonis'}`}
        subtitle={
          settings.tagline ||
          'A atlética que representa o curso de Direito dentro e fora das quadras.'
        }
        imageUrl={settings.default_hero_image}
      />

      <section className="site-container py-14">
        <div className="grid gap-6 lg:grid-cols-3">
          <TextBlock icon={Sparkles} title="Nossa história" text={settings.history_text} />
          <TextBlock icon={Target} title="Missão" text={settings.mission_text} />
          <TextBlock icon={Shield} title="Valores" text={settings.values_text} />
        </div>

        {!settings.history_text && !settings.mission_text && !settings.values_text && (
          <div className="mt-10">
            <EmptyState
              title="Conteúdo institucional em preparação"
              message="A história, a missão e os valores da atlética serão publicados pela diretoria pelo painel administrativo."
            />
          </div>
        )}

        {(settings.symbols_text || settings.projects_text || settings.achievements_text) && (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <TextBlock icon={Scale} title="Símbolos e identidade" text={settings.symbols_text} />
            <TextBlock icon={Shield} title="Projetos e ações sociais" text={settings.projects_text} />
            <TextBlock icon={Target} title="Conquistas esportivas" text={settings.achievements_text} />
          </div>
        )}
      </section>

      <section className="bg-brand-deep py-16">
        <div className="site-container">
          <SectionHeading
            eyebrow="Gestão"
            title="Diretoria atual"
            subtitle="As pessoas que conduzem a atlética neste ciclo."
            light
          />

          <div className="mt-10">
            {loading && <p className="text-sm text-white/60">Carregando diretoria…</p>}

            {!loading && members.length === 0 && (
              <div className="rounded-2xl border border-white/15 p-8 text-center text-white/60">
                Os nomes da diretoria serão publicados pela gestão da atlética.
              </div>
            )}

            {!loading && members.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {members.map((member) => (
                  <div key={member.id} className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white">
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        className="h-40 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center rounded-xl bg-white/10 font-heading text-2xl text-brand-gold">
                        {member.name
                          .split(' ')
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join('')}
                      </div>
                    )}
                    <p className="mt-4 font-heading text-sm uppercase tracking-tight">{member.name}</p>
                    <p className="text-xs text-brand-gold">{member.role_title}</p>
                    {member.department && <p className="mt-1 text-xs text-white/50">{member.department}</p>}
                    {member.bio && <p className="mt-3 text-xs leading-relaxed text-white/70">{member.bio}</p>}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="mt-3 inline-flex items-center gap-2 text-xs text-white/80 hover:text-brand-gold"
                      >
                        <Mail className="h-3.5 w-3.5" /> {member.email}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="site-container py-16">
        <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-8 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-xl uppercase tracking-tight text-brand-deep">Contato oficial</h2>
            <div className="gavel-rule mt-3" />
            <ul className="mt-6 space-y-4 text-sm text-slate-600">
              {settings.contact_email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-brand-primary" />
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-brand-deep">
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-brand-primary" /> {settings.contact_phone}
                </li>
              )}
              {(settings.address || settings.city) && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-brand-primary" />
                  <span>
                    {settings.address}
                    {settings.address && settings.city ? ' — ' : ''}
                    {settings.city}
                  </span>
                </li>
              )}
              {!settings.contact_email && !settings.contact_phone && (
                <li className="text-slate-400">Os canais de contato serão publicados pela diretoria.</li>
              )}
            </ul>
          </div>
          <div className="flex flex-col justify-center gap-3 rounded-2xl bg-brand-soft p-7">
            <p className="font-heading text-base uppercase tracking-tight text-brand-deep">
              Quer fazer parte da atlética?
            </p>
            <p className="text-sm text-slate-600">
              Fale com a diretoria, participe das seletivas das modalidades e acompanhe os eventos abertos.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                to="/contato"
                className="rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white"
              >
                Enviar mensagem
              </Link>
              <Link
                to="/patrocinadores"
                className="rounded-full border border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep"
              >
                Patrocinadores
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}