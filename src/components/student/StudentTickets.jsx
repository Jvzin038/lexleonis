import React from 'react';
import EmptyState from '@/components/site/EmptyState';
import TicketCard from '@/components/student/TicketCard';

export default function StudentTickets({ tickets, emptyTitle, emptyMessage }) {
  if (!tickets || tickets.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || 'Nenhum ingresso por aqui'}
        message={
          emptyMessage ||
          'Ao solicitar um ingresso, ele aparece aqui com QR Code assim que a diretoria confirmar o pagamento.'
        }
        actionLabel="Ver eventos"
        actionTo="/eventos"
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}