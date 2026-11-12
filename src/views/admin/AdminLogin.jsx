import React, { useState } from 'react';
import { Link } from '@/lib/router-compat';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image } from '@/components/ui/image';
import { useSite } from '@/lib/site';
import { safeReturnTo } from '@/lib/authReturnTo';
import { Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import BrandBackdrop from '@/components/site/BrandBackdrop';

export default function AdminLogin() {
  const { settings } = useSite();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const returnTo = safeReturnTo();
  const destination = returnTo === '/' ? '/painel' : returnTo;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = destination;
    } catch (err) {
      setError('Não foi possível entrar. Confira o e-mail e a senha.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-deep px-4 py-12">
      <BrandBackdrop />
      <div className="relative w-full max-w-md">
        <div className="text-center">
          {settings.logo_url ? (
            <Image
              src={settings.logo_url}
              alt={`Logo da ${settings.site_name}`}
              className="mx-auto h-24 w-auto object-contain mix-blend-screen"
              fittingType="fit"
            />
          ) : (
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-gold/60 font-heading text-lg text-brand-gold">
              LL
            </span>
          )}
          <p className="mt-6 flex items-center justify-center gap-2 font-heading text-xs uppercase tracking-[0.2em] text-brand-gold">
            <ShieldCheck className="h-4 w-4" /> Acesso da diretoria
          </p>
          <h1 className="mt-3 font-heading text-2xl uppercase tracking-tight text-white sm:text-3xl">
            Painel administrativo
          </h1>
          <p className="mt-3 text-sm text-white/65">
            Entre com a conta liberada por um administrador da atlética.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
          <div className="mb-6 space-y-2 rounded-lg bg-brand-soft px-4 py-3 text-xs leading-relaxed text-slate-600">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              Aqui só entram contas convidadas por um administrador. Quem não é da diretoria cria a conta de usuário no
              site.
            </p>
            <p className="pl-6 text-slate-500">
              Primeiro acesso?{' '}
              <Link
                to="/register?returnTo=/painel/entrar"
                className="font-semibold text-brand-deep hover:underline"
              >
                Cadastre-se aqui
              </Link>{' '}
              com o e-mail liberado. Após o cadastro, volte aqui para entrar no painel.
            </p>
          </div>

          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">E-mail</Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-password">Senha</Label>
                <Link to="/forgot-password" className="text-xs text-brand-primary hover:underline">
                  Esqueci a senha
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-brand-primary text-sm font-medium text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando…
                </>
              ) : (
                'Entrar no painel'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
            Ainda não foi convidado? Peça a liberação à diretoria da atlética. Alunos e visitantes entram pela área do
            aluno, no site.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          <Link
            to="/"
            className="rounded-full border border-white/25 px-5 py-2.5 text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
          >
            Voltar ao site
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-white/25 px-5 py-2.5 text-white/80 transition-colors hover:border-brand-gold hover:text-brand-gold"
          >
            Área do aluno
          </Link>
        </div>
      </div>
    </div>
  );
}