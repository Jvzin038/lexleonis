import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_SETTINGS, useSite } from '@/lib/site';

const TEXT_FIELDS = [
  { field: 'history_text', label: 'História da atlética' },
  { field: 'mission_text', label: 'Missão' },
  { field: 'values_text', label: 'Valores' },
  { field: 'symbols_text', label: 'Símbolos e identidade' },
  { field: 'projects_text', label: 'Projetos e ações sociais' },
  { field: 'achievements_text', label: 'Conquistas esportivas' },
];

export default function AdminConfiguracoes() {
  const { refresh } = useSite();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    (async () => {
      const page = await base44.entities.SiteSettings.list({ sort: '-updated_date', limit: 1 });
      setSettings({ ...DEFAULT_SETTINGS, ...(page?.items?.[0] || {}) });
    })();
  }, []);

  const update = (field) => (event) => setSettings((current) => ({ ...current, [field]: event.target.value }));

  const save = async () => {
    setSaving(true);
    setFeedback('');
    try {
      const payload = { ...settings };
      const id = payload.id;
      delete payload.id;
      delete payload.created_date;
      delete payload.updated_date;
      delete payload.created_by_id;

      if (id) await base44.entities.SiteSettings.update(id, payload);
      else await base44.entities.SiteSettings.create(payload);

      const user = await base44.auth.me();
      await base44.entities.AdminLog.create({
        action: 'Atualizou configurações gerais',
        module: 'Configurações',
        record_label: 'Conteúdo institucional e pagamentos',
        user_email: user?.email || '',
        user_name: user?.full_name || '',
      });

      await refresh();
      setFeedback('Configurações salvas.');
    } catch (error) {
      setFeedback('Não foi possível salvar agora.');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Configurações gerais</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Conteúdo institucional da página “A Atlética”, categorias e as regras de inscrição e pagamento.
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="rounded-full bg-brand-primary">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar
        </Button>
      </div>

      {feedback && (
        <p className="flex items-center gap-2 rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand-deep">
          <CheckCircle2 className="h-4 w-4" /> {feedback}
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">Conteúdo institucional</h3>
        <p className="mt-1 text-sm text-slate-500">
          Estes textos aparecem na página pública “A Atlética”. Deixe em branco para exibir o aviso de conteúdo em
          preparação.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {TEXT_FIELDS.map((item) => (
            <div key={item.field} className="lg:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">{item.label}</Label>
              <Textarea
                value={settings[item.field] || ''}
                onChange={update(item.field)}
                rows={4}
                className="mt-2"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">
          Inscrições, ingressos e pagamentos
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          O sistema não confirma pagamentos automaticamente. As reservas ficam pendentes até a diretoria validar o
          recebimento e emitir o ingresso digital.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Modo de cobrança</Label>
            <select
              value={settings.checkout_mode || 'preorder'}
              onChange={update('checkout_mode')}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="preorder">Reserva / encomenda com confirmação manual</option>
              <option value="integrated">Cobrança online (requer provedor de pagamento configurado)</option>
            </select>
            <p className="mt-2 text-xs text-slate-400">
              Enquanto não houver credenciais de um provedor de pagamento configuradas, mantenha em reserva para não
              dar a entender que o pagamento online está ativo.
            </p>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Chave Pix da atlética</Label>
            <Input value={settings.pix_key || ''} onChange={update('pix_key')} className="mt-2" />
            <p className="mt-2 text-xs text-slate-400">
              Usada apenas para orientar o pagamento fora do site. Não é uma credencial secreta.
            </p>
          </div>
          <div className="lg:col-span-2">
            <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Aviso exibido na reserva de ingressos
            </Label>
            <Textarea value={settings.checkout_notice || ''} onChange={update('checkout_notice')} rows={3} className="mt-2" />
          </div>
        </div>
      </section>
    </div>
  );
}