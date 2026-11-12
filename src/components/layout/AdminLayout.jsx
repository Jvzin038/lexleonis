import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from '@/lib/router-compat';
import { ExternalLink, LogOut, Menu, ShieldAlert } from 'lucide-react';
import { ADMIN_NAV } from './adminNav';
import { useAuth } from '@/lib/AuthContext';
import { useStaff } from '@/lib/useStaff';
import { useSite } from '@/lib/site';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

function NavList({ permissions, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Navegação do painel">
      {ADMIN_NAV.filter((item) => permissions.includes('*') || permissions.includes(item.permission)).map(
        (item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/painel'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-gold text-brand-ink' : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ),
      )}
    </nav>
  );
}

export default function AdminLayout() {
  const { can, isStaff, loading, user, profile, permissions } = useStaff();
  const { settings } = useSite();
  const { logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-soft">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-deep px-6 text-center text-white">
        <div className="max-w-md">
          <ShieldAlert className="mx-auto h-10 w-10 text-brand-gold" />
          <h1 className="mt-6 font-heading text-2xl uppercase">Acesso restrito</h1>
          <p className="mt-4 text-sm text-white/70">
            {user
              ? 'Sua conta é de usuário do site. O painel é exclusivo da diretoria convidada — para entrar, peça o convite a um administrador.'
              : 'Entre com a conta da diretoria convidada para acessar o painel administrativo.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {user ? (
              <>
                <Link
                  to="/minha-area"
                  className="rounded-full border border-white/25 px-5 py-2.5 text-sm transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  Ir para a minha área
                </Link>
                <Link
                  to="/painel/entrar"
                  className="rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-ink"
                >
                  Entrar com outra conta
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="rounded-full border border-white/25 px-5 py-2.5 text-sm transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  Voltar ao site
                </Link>
                <Link
                  to="/painel/entrar"
                  className="rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-ink"
                >
                  Acesso da diretoria
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const activeLabel = ADMIN_NAV.find((item) => item.path === location.pathname)?.label || 'Painel';

  return (
    <div className="flex min-h-screen bg-brand-soft">
      <aside className="hidden w-72 shrink-0 flex-col bg-brand-deep lg:flex">
        <div className="px-6 py-7">
          <Link to="/" className="font-heading text-sm uppercase tracking-[0.2em] text-brand-gold">
            {settings.short_name || 'Lex Leonis'}
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Painel administrativo</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <NavList permissions={permissions} />
        </div>
        <div className="border-t border-white/10 px-4 py-5">
          <p className="truncate px-3 text-xs text-white/50">{user?.email}</p>
          {profile?.roles?.length > 0 && (
            <p className="truncate px-3 text-xs text-brand-gold">{profile.roles.length} função(ões) atribuída(s)</p>
          )}
          <div className="mt-3 flex flex-col gap-1">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" /> Ver site
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Faixa da cor da marca atrás da barra de status: o cabeçalho não fica
            sobreposto pelo relógio e não sobra área branca no topo do celular */}
        <div className="bg-brand-deep pt-[env(safe-area-inset-top,0px)]">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Abrir menu do painel"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-xs border-l-0 bg-brand-deep text-white">
                <SheetTitle className="font-heading text-sm uppercase tracking-[0.2em] text-brand-gold">
                  Painel
                </SheetTitle>
                <div className="mt-6 max-h-[80vh] overflow-y-auto">
                  <NavList permissions={permissions} onNavigate={() => setOpen(false)} />
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/70"
                    >
                      <LogOut className="h-4 w-4" /> Sair
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <h1 className="truncate font-heading text-base uppercase tracking-tight text-brand-deep sm:text-lg">
                {activeLabel}
              </h1>
              <p className="truncate text-xs text-slate-500">{settings.site_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-brand-deep">{user?.full_name}</p>
              <p className="text-xs text-slate-500">
                {can('*') ? 'Administrador geral' : 'Acesso por permissão'}
              </p>
            </div>
          </div>
        </header>
        </div>

        <main className="flex-1 px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}