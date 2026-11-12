import React from 'react';
import { Link } from '@/lib/router-compat';
import { ShieldAlert } from 'lucide-react';
import { useStaff } from '@/lib/useStaff';

export default function PermissionGate({ permission, title, children }) {
  const { loading, can } = useStaff();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
      </div>
    );
  }

  if (!can(permission)) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-amber-700" />
        <h2 className="mt-4 font-heading text-lg uppercase tracking-tight text-amber-900">
          {title || 'Acesso restrito'}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-amber-900/80">
          Sua função na diretoria não inclui esta área. Peça ao administrador geral a liberação da permissão
          correspondente.
        </p>
        <Link
          to="/painel"
          className="mt-6 inline-flex rounded-full bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white"
        >
          Voltar ao painel
        </Link>
      </div>
    );
  }

  return children;
}