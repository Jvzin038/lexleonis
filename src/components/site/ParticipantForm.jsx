import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ParticipantForm({ index, total, participant, onChange, config }) {
  const update = (field) => (event) => onChange({ ...participant, [field]: event.target.value });

  const requireCpf = config?.require_cpf === true;
  const requireEmail = config?.require_email === true;
  const requirePhone = config?.require_phone === true;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-deep text-sm font-bold text-brand-gold">
          {index + 1}
        </div>
        <p className="font-heading text-sm uppercase tracking-tight text-brand-deep">
          Ingresso {index + 1} — Participante {index + 1} de {total}
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Nome completo *</Label>
          <Input
            value={participant.name || ''}
            onChange={update('name')}
            placeholder="Nome do participante"
            className="mt-2 h-11"
          />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
            CPF {requireCpf ? '*' : '(opcional)'}
          </Label>
          <Input
            value={participant.cpf || ''}
            onChange={update('cpf')}
            placeholder="000.000.000-00"
            className="mt-2 h-11"
          />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Telefone {requirePhone ? '*' : '(opcional)'}
          </Label>
          <Input
            value={participant.phone || ''}
            onChange={update('phone')}
            placeholder="(00) 00000-0000"
            className="mt-2 h-11"
          />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
            E-mail {requireEmail ? '*' : '(opcional)'}
          </Label>
          <Input
            type="email"
            value={participant.email || ''}
            onChange={update('email')}
            placeholder="email@exemplo.com"
            className="mt-2 h-11"
          />
        </div>
      </div>
    </div>
  );
}