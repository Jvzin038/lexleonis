import React, { useState } from 'react';
import { Link } from '@/lib/router-compat';
import { CalendarDays, MapPin, X } from 'lucide-react';
import StatusBadge from '@/components/site/StatusBadge';
import EmptyState from '@/components/site/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';

export default function StudentRegistrations({ registrations, onCancel }) {
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const cancel = async (registration) => {
    setError('');
    setBusyId(registration.id);
    try {
      await onCancel(registration);
    } catch (cancelError) {
      setError(
        cancelError?.response?.data?.error ||
          'Não foi possível cancelar esta inscrição. Fale com a diretoria.',
      );
    } finally {
      setBusyId('');
    }
  };

  if (registrations.length === 0) {
    return (
      <EmptyState
        title="Nenhuma inscrição registrada"
        message="Quando você se inscrever em um evento, a inscrição aparece aqui com o status atualizado."
        actionLabel="Ver eventos"
        actionTo="/eventos"
      />
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {registrations.map((registration) => {
        const canCancel = ['pending', 'confirmed', 'waitlist'].includes(registration.status);
        return (
          <div key={registration.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-heading text-sm uppercase tracking-tight text-brand-deep">
                  {registration.event_title || 'Evento'}
                </p>
                <p className="mt-1 text-xs text-slate-500">{registration.ticket_type_name}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge kind="registration" value={registration.status} />
                <StatusBadge kind="payment" value={registration.payment_status} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-5 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5" /> Registrada em {formatDate(registration.created_date)}
              </span>
              <span className="font-mono">Código: {registration.code || '—'}</span>
              <span className="font-mono">
                {registration.quantity}x {formatCurrency(registration.unit_price)} ={' '}
                {formatCurrency(registration.total_amount)}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {registration.event_id && (
                <Link
                  to={`/eventos/${registration.event_id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep hover:bg-brand-soft"
                >
                  <MapPin className="h-3.5 w-3.5" /> Ver evento
                </Link>
              )}
              {canCancel && (
                <button
                  type="button"
                  disabled={busyId === registration.id}
                  onClick={() => cancel(registration)}
                  className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" /> Cancelar inscrição
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}