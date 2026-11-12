import React from 'react';
import { Check } from 'lucide-react';

const STEP_LIST = [
  { key: 'select', label: 'Ingresso' },
  { key: 'participants', label: 'Participantes' },
  { key: 'review', label: 'Revisão' },
  { key: 'pix', label: 'Pagamento' },
  { key: 'done', label: 'Confirmação' },
];

export default function CheckoutSteps({ current, free }) {
  const steps = free ? STEP_LIST.filter((s) => s.key !== 'pix') : STEP_LIST;
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isActive
                      ? 'bg-brand-deep text-brand-gold'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <span
                className={`hidden text-[0.65rem] font-semibold uppercase tracking-[0.08em] sm:block ${
                  isActive ? 'text-brand-deep' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-4 shrink-0 rounded-full sm:w-8 ${
                  index < currentIndex ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}