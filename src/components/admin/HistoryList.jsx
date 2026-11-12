import React from 'react';

export default function HistoryList({ items, moduleLabel = 'Registro' }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-500">Nenhum registro de histórico ainda.</p>;
  }

  return (
    <ol className="space-y-3">
      {items.map((entry) => (
        <li key={entry.id} className="border-l-2 border-brand-primary/40 pl-4">
          <p className="text-sm font-medium text-brand-deep">{entry.action}</p>
          <p className="text-xs text-slate-500">
            {new Date(entry.created_date).toLocaleString('pt-BR')} · {entry.user_name || entry.user_email || moduleLabel}
          </p>
          {entry.details && <p className="mt-1 text-xs text-slate-600">{entry.details}</p>}
        </li>
      ))}
    </ol>
  );
}