import { Link } from '@/lib/router-compat';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';

export default function PageNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-surface">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-20 text-center">
        <div className="max-w-lg">
          <p className="font-display text-7xl font-bold text-brand-gold sm:text-8xl">404</p>
          <div className="gavel-rule mx-auto mt-6" />
          <h1 className="mt-8 text-3xl font-semibold text-brand-deep sm:text-4xl">Página não encontrada</h1>
          <p className="mt-4 leading-relaxed text-brand-deep/70">
            A página que você procurou não existe ou foi removida.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.03]"
          >
            Voltar para o início
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
