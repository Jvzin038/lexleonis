import React from 'react';
import { UserRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BuyerForm({ buyer, onChange, requirePhone, requireCpf }) {
  const update = (field) => (event) => onChange({ ...buyer, [field]: event.target.value });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <UserRound className="h-5 w-5 text-brand-primary" />
        <p className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">
          Dados do comprador
        </p>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        O responsável pela compra recebe o resumo e o acesso aos ingressos.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Nome completo *</Label>
          <Input
            value={buyer.name || ''}
            onChange={update('name')}
            placeholder="Seu nome completo"
            className="mt-2 h-11"
          />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">E-mail *</Label>
          <Input
            type="email"
            value={buyer.email || ''}
            onChange={update('email')}
            placeholder="email@exemplo.com"
            className="mt-2 h-11"
          />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Telefone com DDD {requirePhone ? '*' : '(opcional)'}
          </Label>
          <Input
            value={buyer.phone || ''}
            onChange={update('phone')}
            placeholder="(00) 00000-0000"
            className="mt-2 h-11"
          />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
            CPF/CNPJ do comprador {requireCpf ? '*' : '(opcional)'}
          </Label>
          <Input
            value={buyer.cpf || ''}
            onChange={update('cpf')}
            placeholder="000.000.000-00"
            className="mt-2 h-11"
          />
          {requireCpf && (
            <p className="mt-1 text-xs text-slate-400">
              Necessário para gerar a cobrança Pix.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}