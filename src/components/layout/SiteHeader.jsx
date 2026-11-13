import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from '@/lib/router-compat';
import { LayoutDashboard, Menu, ShoppingBag, Ticket, UserRound } from 'lucide-react';
import { useNav, useSite } from '@/lib/site';
import { useAuth } from '@/lib/AuthContext';
import { useStaff } from '@/lib/useStaff';
import { Image } from '@/components/ui/image';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/lib/cart';

export default function SiteHeader() {
  const { settings } = useSite();
  const navItems = useNav('main').filter((item) => item.visible !== false);
  const { isAuthenticated, user } = useAuth();
  const { isStaff } = useStaff();
  const { count } = useCart();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const studentLink = isAuthenticated ? '/minha-area' : '/login';

  const brand = (
    <Link to="/" className="flex items-center gap-3" aria-label={settings.site_name}>
      {settings.logo_url ? (
        <Image
          src={settings.logo_url}
          alt={`Logo da ${settings.site_name}`}
          className="h-10 w-auto object-contain sm:h-14"
          fittingType="fit"
        />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/70 font-heading text-sm text-brand-gold sm:h-14 sm:w-14 sm:text-base">
          LL
        </span>
      )}
      <span className="hidden leading-tight sm:block">
        <span className="block font-heading text-sm uppercase tracking-[0.18em] text-white">
          {settings.short_name || 'Lex Leonis'}
        </span>
        <span className="block text-[0.65rem] uppercase tracking-[0.22em] text-brand-gold">
          Atlética Acadêmica
        </span>
      </span>
    </Link>
  );

  return (
    <header
      className={`site-header-safe sticky top-0 z-50 border-b border-white/10 bg-brand-deep transition-shadow ${
        scrolled ? 'shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)]' : ''
      }`}
    >
      <div className="site-container flex h-16 items-center justify-between gap-2 sm:h-20 sm:gap-4">
        {brand}

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Navegação principal">
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.id}
                href={item.path}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-2 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-full px-2 py-2 text-xs font-medium transition-colors ${
                    isActive ? 'bg-white/10 text-brand-gold' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to={studentLink}
            className="hidden items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-brand-gold hover:text-brand-gold sm:flex"
          >
            <UserRound className="h-4 w-4" />
            {isAuthenticated ? user?.full_name?.split(' ')[0] || 'Minha área' : 'Área do aluno'}
          </Link>

          {isStaff && (
            <Link
              to="/painel"
              className="hidden items-center gap-2 rounded-full border border-brand-gold/50 px-4 py-2 text-sm font-medium text-brand-gold transition-colors hover:bg-brand-gold/10 md:flex"
            >
              <LayoutDashboard className="h-4 w-4" />
              Painel
            </Link>
          )}

          <Link
            to="/eventos"
            className="flex shrink-0 items-center gap-2 rounded-full bg-brand-gold px-4 py-2.5 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.03] sm:px-5"
          >
            <Ticket className="h-4 w-4" />
            Ingressos
          </Link>

          <Link
            to="/carrinho"
            aria-label={count > 0 ? `Meu carrinho (${count})` : 'Meu carrinho'}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-gold px-1 font-mono text-[0.65rem] font-bold text-brand-ink">
                {count}
              </span>
            )}
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white xl:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm border-l-0 bg-brand-deep text-white">
              <SheetTitle className="font-heading text-sm uppercase tracking-[0.2em] text-brand-gold">
                {settings.short_name || 'Lex Leonis'}
              </SheetTitle>
              <nav className="mt-8 flex flex-col gap-1" aria-label="Navegação móvel">
                {navItems.map((item) =>
                  item.external ? (
                    <a
                      key={item.id}
                      href={item.path}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg px-4 py-3 text-base text-white/85 hover:bg-white/10"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.id}
                      to={item.path}
                      className="rounded-lg px-4 py-3 text-base text-white/85 hover:bg-white/10"
                    >
                      {item.label}
                    </Link>
                  ),
                )}
                <div className="my-4 h-px bg-white/10" />
                <Link to={studentLink} className="rounded-lg px-4 py-3 text-base text-white/85 hover:bg-white/10">
                  {isAuthenticated ? 'Minha área' : 'Área do aluno'}
                </Link>
                {isStaff && (
                  <Link to="/painel" className="rounded-lg px-4 py-3 text-base text-brand-gold hover:bg-white/10">
                    Painel administrativo
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}