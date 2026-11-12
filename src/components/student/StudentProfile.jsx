import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StudentProfile({ user, onSaved }) {
  const [form, setForm] = useState({
    phone: user?.phone || '',
    course: user?.course || 'Direito',
    period: user?.period || '',
    registration_number: user?.registration_number || '',
    instagram: user?.instagram || '',
  });
  const [status, setStatus] = useState('idle');

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setStatus('saving');
    try {
      await base44.auth.updateMe(form);
      setStatus('saved');
      onSaved?.();
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-heading text-base uppercase tracking-tight text-brand-deep">Meus dados</h2>
      <p className="mt-2 text-sm text-slate-500">
        Nome e e-mail vêm da sua conta acadêmica. Complete as informações usadas nas inscrições e na loja.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Nome</Label>
          <Input value={user?.full_name || ''} disabled className="mt-2 h-11 bg-slate-50" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">E-mail</Label>
          <Input value={user?.email || ''} disabled className="mt-2 h-11 bg-slate-50" />
        </div>
        <div>
          <Label htmlFor="perfil-telefone" className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Telefone / WhatsApp
          </Label>
          <Input id="perfil-telefone" value={form.phone} onChange={update('phone')} className="mt-2 h-11" />
        </div>
        <div>
          <Label htmlFor="perfil-curso" className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Curso
          </Label>
          <Input id="perfil-curso" value={form.course} onChange={update('course')} className="mt-2 h-11" />
        </div>
        <div>
          <Label htmlFor="perfil-periodo" className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Período / semestre
          </Label>
          <Input id="perfil-periodo" value={form.period} onChange={update('period')} className="mt-2 h-11" />
        </div>
        <div>
          <Label htmlFor="perfil-matricula" className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Matrícula
          </Label>
          <Input
            id="perfil-matricula"
            value={form.registration_number}
            onChange={update('registration_number')}
            className="mt-2 h-11"
          />
        </div>
        <div>
          <Label htmlFor="perfil-instagram" className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Instagram
          </Label>
          <Input id="perfil-instagram" value={form.instagram} onChange={update('instagram')} className="mt-2 h-11" />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button type="submit" disabled={status === 'saving'} className="rounded-full bg-brand-primary px-6 py-5">
          {status === 'saving' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar dados
        </Button>
        {status === 'saved' && <span className="text-sm font-medium text-emerald-700">Dados atualizados.</span>}
        {status === 'error' && (
          <span className="text-sm font-medium text-red-600">Não foi possível salvar agora.</span>
        )}
      </div>
    </form>
  );
}