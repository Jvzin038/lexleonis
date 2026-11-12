import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { isEmail } from '@/lib/format';

export default function ContactForm({ type = 'contact', submitLabel = 'Enviar mensagem', showSubject = true }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Informe seu nome.');
      return;
    }
    if (!isEmail(form.email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (form.message.trim().length < 10) {
      setError('Escreva uma mensagem com pelo menos 10 caracteres.');
      return;
    }

    setStatus('sending');
    try {
      await base44.entities.ContactMessage.create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: type === 'sponsorship' ? form.subject || 'Interesse em patrocínio' : form.subject.trim(),
        message: form.message.trim(),
        type,
        status: 'new',
      });
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (submitError) {
      setStatus('idle');
      setError('Não foi possível enviar sua mensagem agora. Tente novamente em instantes.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-start rounded-2xl border border-emerald-200 bg-emerald-50 p-7">
        <CheckCircle2 className="h-7 w-7 text-emerald-700" />
        <p className="mt-4 font-heading text-base uppercase tracking-tight text-emerald-900">Mensagem enviada</p>
        <p className="mt-2 text-sm text-emerald-900/80">
          Recebemos seu contato. A diretoria responde pelo e-mail informado.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${type}-nome`} className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Nome *
          </Label>
          <Input
            id={`${type}-nome`}
            value={form.name}
            onChange={update('name')}
            required
            className="mt-2 h-11"
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <Label htmlFor={`${type}-email`} className="text-xs uppercase tracking-[0.14em] text-slate-500">
            E-mail *
          </Label>
          <Input
            id={`${type}-email`}
            type="email"
            value={form.email}
            onChange={update('email')}
            required
            className="mt-2 h-11"
            placeholder="voce@email.com"
          />
        </div>
        <div>
          <Label htmlFor={`${type}-telefone`} className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Telefone
          </Label>
          <Input
            id={`${type}-telefone`}
            value={form.phone}
            onChange={update('phone')}
            className="mt-2 h-11"
            placeholder="(00) 00000-0000"
          />
        </div>
        {showSubject && (
          <div>
            <Label htmlFor={`${type}-assunto`} className="text-xs uppercase tracking-[0.14em] text-slate-500">
              {type === 'sponsorship' ? 'Empresa' : 'Assunto'}
            </Label>
            <Input
              id={`${type}-assunto`}
              value={form.subject}
              onChange={update('subject')}
              className="mt-2 h-11"
              placeholder={type === 'sponsorship' ? 'Nome da empresa' : 'Sobre o que quer falar'}
            />
          </div>
        )}
      </div>

      <div className="mt-5">
        <Label htmlFor={`${type}-mensagem`} className="text-xs uppercase tracking-[0.14em] text-slate-500">
          Mensagem *
        </Label>
        <Textarea
          id={`${type}-mensagem`}
          value={form.message}
          onChange={update('message')}
          required
          rows={6}
          className="mt-2"
          placeholder="Escreva sua mensagem"
        />
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-red-600">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={status === 'sending'}
        className="mt-6 w-full rounded-full bg-brand-primary py-6 text-sm font-semibold hover:bg-brand-deep"
      >
        {status === 'sending' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando…
          </>
        ) : (
          submitLabel
        )}
      </Button>

      <p className="mt-4 text-xs leading-relaxed text-slate-400">
        Seus dados são usados apenas para responder este contato, conforme a política de privacidade da atlética.
      </p>
    </form>
  );
}