import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image } from '@/components/ui/image';
import SiteSectionsManager from '@/components/admin/SiteSectionsManager';
import { DEFAULT_SETTINGS, useSite } from '@/lib/site';

const HEADING_FONTS = ['Unbounded', 'Archivo Black', 'Oswald', 'Montserrat', 'Bebas Neue', 'Inter'];
const BODY_FONTS = ['Inter', 'Montserrat', 'Work Sans', 'Source Sans 3'];

const TAB_CLASS =
  'rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-deep data-state=active:border-brand-deep';

export default function AdminSite() {
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

  const update = (field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setSettings((current) => ({ ...current, [field]: value }));
  };

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
        action: 'Publicou alterações em Personalizar site',
        module: 'Personalizar site',
        record_label: payload.site_name,
        user_email: user?.email || '',
        user_name: user?.full_name || '',
      });

      await refresh();
      setFeedback('Alterações publicadas. O site já mostra as novas configurações.');
    } catch (error) {
      setFeedback('Não foi possível salvar as alterações agora.');
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
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Personalizar site</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Identidade, cores, tipografia, contatos, avisos e a estrutura da página inicial — tudo sem alterar código.
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="rounded-full bg-brand-primary">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Publicar alterações
        </Button>
      </div>

      {feedback && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand-deep">
          <CheckCircle2 className="h-4 w-4" /> {feedback}
        </p>
      )}

      <Tabs defaultValue="identidade" className="mt-8">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          {[
            { value: 'identidade', label: 'Identidade' },
            { value: 'cores', label: 'Cores e tipografia' },
            { value: 'secoes', label: 'Seções da home' },
            { value: 'contato', label: 'Contato e redes' },
            { value: 'pagamentos', label: 'Pagamentos' },
            { value: 'avisos', label: 'Avisos e SEO' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-deep data-[state=active]:border-brand-deep data-[state=active]:bg-brand-deep data-[state=active]:text-white"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="identidade" className="mt-8">
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 lg:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Nome oficial da atlética</Label>
              <Input value={settings.site_name || ''} onChange={update('site_name')} className="mt-2" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Nome curto</Label>
              <Input value={settings.short_name || ''} onChange={update('short_name')} className="mt-2" />
            </div>
            <div className="lg:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Slogan</Label>
              <Input value={settings.tagline || ''} onChange={update('tagline')} className="mt-2" />
            </div>
            <div className="lg:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Descrição do site</Label>
              <Textarea value={settings.description || ''} onChange={update('description')} rows={3} className="mt-2" />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Logotipo</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-20 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {settings.logo_url ? (
                    <Image src={settings.logo_url} alt="" className="h-full w-full object-contain" fittingType="fit" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      sem logotipo
                    </span>
                  )}
                </div>
                <label className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep">
                  Enviar logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
                      setSettings((current) => ({ ...current, logo_url: file_url }));
                    }}
                  />
                </label>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Envie o arquivo original da logo da atlética. A imagem é usada no cabeçalho, no rodapé e nas prévias.
              </p>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Ícone do site (favicon)</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {settings.favicon_url ? (
                    <Image src={settings.favicon_url} alt="" className="h-full w-full object-contain" fittingType="fit" />
                  ) : null}
                </div>
                <label className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep">
                  Enviar favicon
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
                      setSettings((current) => ({ ...current, favicon_url: file_url }));
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cores" className="mt-8">
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 lg:grid-cols-2">
            {[
              { field: 'color_deep', label: 'Roxo escuro (fundo principal)' },
              { field: 'color_primary', label: 'Roxo vibrante (ações)' },
              { field: 'color_gold', label: 'Dourado (destaques)' },
              { field: 'color_ink', label: 'Preto (rodapé e textos)' },
              { field: 'color_surface', label: 'Branco (superfícies)' },
            ].map((color) => (
              <div key={color.field}>
                <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">{color.label}</Label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="color"
                    value={settings[color.field] || '#000000'}
                    onChange={update(color.field)}
                    className="h-11 w-16 cursor-pointer rounded-lg border border-slate-200"
                    aria-label={color.label}
                  />
                  <Input value={settings[color.field] || ''} onChange={update(color.field)} className="font-mono" />
                </div>
              </div>
            ))}

            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Fonte dos títulos</Label>
              <select
                value={settings.font_heading || 'Unbounded'}
                onChange={update('font_heading')}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                {HEADING_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Fonte dos textos</Label>
              <select
                value={settings.font_body || 'Inter'}
                onChange={update('font_body')}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                {BODY_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2 rounded-2xl bg-brand-soft p-6">
              <p className="font-heading text-xs uppercase tracking-[0.18em] text-brand-deep">Prévia</p>
              <p
                className="mt-4 text-2xl"
                style={{
                  color: settings.color_deep,
                  fontFamily: `'${settings.font_heading || 'Unbounded'}', system-ui, sans-serif`,
                }}
              >
                Lex Leonis — Atlética do curso de Direito
              </p>
              <p
                className="mt-2 text-sm"
                style={{
                  color: settings.color_ink,
                  fontFamily: `'${settings.font_body || 'Inter'}', system-ui, sans-serif`,
                }}
              >
                Texto de exemplo para conferir a combinação de cores e tipografia escolhida.
              </p>
              <div className="mt-4 flex gap-3">
                <span
                  className="rounded-full px-5 py-2 text-sm font-semibold"
                  style={{ backgroundColor: settings.color_primary, color: '#fff' }}
                >
                  Botão de ação
                </span>
                <span
                  className="rounded-full px-5 py-2 text-sm font-semibold"
                  style={{ backgroundColor: settings.color_gold, color: settings.color_ink }}
                >
                  Destaque
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="secoes" className="mt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <SiteSectionsManager />
          </div>
        </TabsContent>

        <TabsContent value="contato" className="mt-8">
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 lg:grid-cols-2">
            {[
              { field: 'contact_email', label: 'E-mail de contato' },
              { field: 'contact_phone', label: 'Telefone' },
              { field: 'whatsapp', label: 'WhatsApp (com DDD)' },
              { field: 'address', label: 'Endereço' },
              { field: 'city', label: 'Cidade / campus' },
              { field: 'map_url', label: 'Link do mapa' },
              { field: 'instagram', label: 'Instagram (link completo)' },
              { field: 'tiktok', label: 'TikTok' },
              { field: 'youtube', label: 'YouTube' },
              { field: 'facebook', label: 'Facebook' },
              { field: 'x_url', label: 'X (Twitter)' },
            ].map((item) => (
              <div key={item.field}>
                <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">{item.label}</Label>
                <Input value={settings[item.field] || ''} onChange={update(item.field)} className="mt-2" />
              </div>
            ))}
            <div className="lg:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Texto do rodapé</Label>
              <Textarea value={settings.footer_text || ''} onChange={update('footer_text')} rows={3} className="mt-2" />
            </div>
            <div className="lg:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Nota do rodapé (linha final)
              </Label>
              <Input value={settings.footer_note || ''} onChange={update('footer_note')} className="mt-2" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pagamentos" className="mt-8">
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="lg:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Modo de cobrança de ingressos
              </Label>
              <select
                value={settings.checkout_mode || 'preorder'}
                onChange={update('checkout_mode')}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="preorder">Pré-pedido (WhatsApp manual)</option>
                <option value="integrated">Pix automático (Stripe)</option>
              </select>
              <p className="mt-2 text-xs text-slate-500">
                No modo <strong>Pix automático</strong>, a cobrança é gerada no ato da compra e o ingresso é emitido
                automaticamente após a confirmação do pagamento pelo servidor. No modo <strong>Pré-pedido</strong>, o
                comprador envia o resumo pelo WhatsApp e a diretoria confirma manualmente.
              </p>
            </div>

            <div className="lg:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Aviso exibido no checkout (pré-pedido)
              </Label>
              <Textarea
                value={settings.checkout_notice || ''}
                onChange={update('checkout_notice')}
                rows={2}
                className="mt-2"
                placeholder="Texto exibido acima do formulário de compra no modo pré-pedido"
              />
            </div>

            <div className="lg:col-span-2 rounded-2xl bg-brand-soft p-5">
              <p className="font-heading text-xs uppercase tracking-[0.16em] text-brand-deep">
                Configuração do Stripe
              </p>
              <p className="mt-2 text-xs text-slate-600">
                O Stripe está conectado em modo teste. Para receber pagamentos reais, acesse
                <strong> Dashboard → Integrações</strong> e forneça suas chaves de produção do Stripe.
                O webhook de confirmação automática já está registrado.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="avisos" className="mt-8">
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Título para mecanismos de busca
              </Label>
              <Input value={settings.seo_title || ''} onChange={update('seo_title')} className="mt-2" />
            </div>
            <div className="lg:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Descrição para buscadores</Label>
              <Textarea value={settings.seo_description || ''} onChange={update('seo_description')} rows={3} className="mt-2" />
            </div>
            <div className="lg:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Palavras-chave</Label>
              <Input value={settings.seo_keywords || ''} onChange={update('seo_keywords')} className="mt-2" />
            </div>

            <div className="lg:col-span-2 rounded-2xl bg-brand-soft p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading text-xs uppercase tracking-[0.16em] text-brand-deep">
                    Faixa de aviso no topo do site
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Ideal para avisos rápidos, como mudança de local de um evento.
                  </p>
                </div>
                <Switch
                  checked={Boolean(settings.announcement_active)}
                  onCheckedChange={(checked) => setSettings((current) => ({ ...current, announcement_active: checked }))}
                />
              </div>
              <Input
                value={settings.announcement_text || ''}
                onChange={update('announcement_text')}
                placeholder="Texto do aviso"
                className="mt-4"
              />
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading text-xs uppercase tracking-[0.16em] text-amber-900">
                    Modo manutenção
                  </p>
                  <p className="mt-1 text-xs text-amber-900/80">
                    Visitantes veem a página de manutenção; a diretoria continua com acesso ao site e ao painel.
                  </p>
                </div>
                <Switch
                  checked={Boolean(settings.maintenance_mode)}
                  onCheckedChange={(checked) => setSettings((current) => ({ ...current, maintenance_mode: checked }))}
                />
              </div>
              <Input
                value={settings.maintenance_title || ''}
                onChange={update('maintenance_title')}
                placeholder="Título da página de manutenção"
                className="mt-4"
              />
              <Textarea
                value={settings.maintenance_message || ''}
                onChange={update('maintenance_message')}
                rows={3}
                placeholder="Mensagem exibida aos visitantes"
                className="mt-3"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}