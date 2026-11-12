import React from 'react';
import { Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import PageHero from '@/components/site/PageHero';
import ContactForm from '@/components/site/ContactForm';
import { useSite } from '@/lib/site';
import usePageMeta from '@/hooks/usePageMeta';

export default function Contato() {
  usePageMeta('Contato', 'Fale com a diretoria da Atlética Lex Leonis.');
  const { settings } = useSite();

  return (
    <div>
      <PageHero
        eyebrow="Fale com a atlética"
        title="Contato"
        subtitle="Dúvidas sobre eventos, ingressos, esportes, loja ou patrocínio? Envie sua mensagem para a diretoria."
      />

      <section className="site-container py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">Canais oficiais</h2>
              <div className="gavel-rule mt-3" />
              <ul className="mt-5 space-y-4 text-sm text-slate-600">
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
                {settings.whatsapp && (
                  <li className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-brand-primary" />
                    <a
                      href={`https://wa.me/${String(settings.whatsapp).replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-brand-deep"
                    >
                      WhatsApp {settings.whatsapp}
                    </a>
                  </li>
                )}
                {settings.instagram && (
                  <li className="flex items-center gap-3">
                    <Instagram className="h-4 w-4 text-brand-primary" />
                    <a href={settings.instagram} target="_blank" rel="noreferrer" className="hover:text-brand-deep">
                      Instagram oficial
                    </a>
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
                {!settings.contact_email && !settings.contact_phone && !settings.whatsapp && (
                  <li className="text-slate-400">
                    Os canais oficiais serão publicados pela diretoria pelo painel administrativo.
                  </li>
                )}
              </ul>
            </div>

            {settings.map_url && (
              <a
                href={settings.map_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl bg-brand-deep p-6 text-white transition-transform hover:scale-[1.01]"
              >
                <span>
                  <span className="font-heading text-sm uppercase tracking-[0.16em] text-brand-gold">
                    Como chegar
                  </span>
                  <span className="mt-2 block text-sm text-white/75">
                    Abra a localização da atlética no mapa.
                  </span>
                </span>
                <MapPin className="h-6 w-6 text-brand-gold" />
              </a>
            )}

            <div className="rounded-2xl bg-brand-soft p-6 text-sm text-slate-600">
              <p className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">Imprensa e parcerias</p>
              <p className="mt-3">
                Para propostas comerciais, use a página{' '}
                <a href="/seja-patrocinador" className="font-semibold text-brand-primary">
                  Seja patrocinador
                </a>
                . Assim sua proposta chega direto à diretoria responsável.
              </p>
            </div>
          </div>

          <ContactForm type="contact" submitLabel="Enviar mensagem" />
        </div>
      </section>
    </div>
  );
}