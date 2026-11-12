import React from 'react';
import { Link } from '@/lib/router-compat';
import { Mail, MapPin, Phone, Instagram, Youtube, Facebook, Music2 } from 'lucide-react';
import { useNav, useSite } from '@/lib/site';
import { Image } from '@/components/ui/image';

function FooterLink({ item }) {
  if (item.external) {
    return (
      <a href={item.path} target="_blank" rel="noreferrer" className="transition-colors hover:text-brand-gold">
        {item.label}
      </a>
    );
  }
  return (
    <Link to={item.path} className="transition-colors hover:text-brand-gold">
      {item.label}
    </Link>
  );
}

export default function SiteFooter({ legalPages = [] }) {
  const { settings } = useSite();
  const footerItems = useNav('footer');
  const year = new Date().getFullYear();

  const socials = [
    { url: settings.instagram, icon: Instagram, label: 'Instagram' },
    { url: settings.tiktok, icon: Music2, label: 'TikTok' },
    { url: settings.youtube, icon: Youtube, label: 'YouTube' },
    { url: settings.facebook, icon: Facebook, label: 'Facebook' },
  ].filter((item) => item.url);

  return (
    <footer className="bg-brand-ink text-white/75">
      <div className="site-container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            {settings.logo_url ? (
              <Image
                src={settings.logo_url}
                alt={`Logo da ${settings.site_name}`}
                className="h-14 w-auto object-contain"
                fittingType="fit"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-gold/60 font-heading text-lg text-brand-gold">
                LL
              </span>
            )}
            <div>
              <p className="font-heading text-sm uppercase tracking-[0.2em] text-brand-gold">
                {settings.short_name || 'Lex Leonis'}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Atlética Acadêmica</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed">
            {settings.footer_text || settings.description}
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-heading text-xs uppercase tracking-[0.22em] text-white">Navegação</h3>
          <div className="gavel-rule mt-4" />
          <ul className="mt-5 space-y-2 text-sm">
            {footerItems.map((item) => (
              <li key={item.id}>
                <FooterLink item={item} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-xs uppercase tracking-[0.22em] text-white">Institucional</h3>
          <div className="gavel-rule mt-4" />
          <ul className="mt-5 space-y-2 text-sm">
            {legalPages.map((page) => (
              <li key={page.id}>
                <Link to={`/pagina/${page.slug}`} className="transition-colors hover:text-brand-gold">
                  {page.title}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/contato" className="transition-colors hover:text-brand-gold">
                Contato
              </Link>
            </li>
            <li>
              <Link to="/faq" className="transition-colors hover:text-brand-gold">
                Perguntas frequentes
              </Link>
            </li>
            <li>
              <Link to="/painel/entrar" className="transition-colors hover:text-brand-gold">
                Acesso da diretoria
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-xs uppercase tracking-[0.22em] text-white">Contato</h3>
          <div className="gavel-rule mt-4" />
          <ul className="mt-5 space-y-3 text-sm">
            {settings.contact_email && (
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-brand-gold" />
                <a href={`mailto:${settings.contact_email}`} className="hover:text-brand-gold">
                  {settings.contact_email}
                </a>
              </li>
            )}
            {settings.contact_phone && (
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-brand-gold" />
                <span>{settings.contact_phone}</span>
              </li>
            )}
            {(settings.address || settings.city) && (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-brand-gold" />
                <span>
                  {settings.address}
                  {settings.address && settings.city ? ' — ' : ''}
                  {settings.city}
                </span>
              </li>
            )}
            {!settings.contact_email && !settings.contact_phone && !settings.address && (
              <li className="text-white/45">
                Os dados de contato serão publicados pela diretoria.
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="site-container flex flex-col gap-3 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.site_name}. Todos os direitos reservados.
          </p>
          <p>{settings.footer_note || 'Site oficial da atlética — conteúdo administrado pela diretoria.'}</p>
        </div>
      </div>
    </footer>
  );
}