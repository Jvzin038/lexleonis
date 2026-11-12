import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Image } from '@/components/ui/image';

const SECTION_TYPES = [
  { value: 'hero', label: 'Banner principal' },
  { value: 'events', label: 'Próximos eventos' },
  { value: 'featured_events', label: 'Eventos em destaque' },
  { value: 'calendar', label: 'Calendário / agenda' },
  { value: 'matches', label: 'Próximos jogos' },
  { value: 'gallery', label: 'Galeria de momentos' },
  { value: 'news', label: 'Notícias e comunicados' },
  { value: 'shop', label: 'Produtos da loja' },
  { value: 'sponsors', label: 'Patrocinadores' },
  { value: 'social', label: 'Redes sociais' },
  { value: 'about', label: 'Sobre a atlética' },
  { value: 'text', label: 'Bloco de texto' },
  { value: 'cta', label: 'Chamada para ação' },
];

const BACKGROUNDS = [
  { value: 'light', label: 'Fundo claro' },
  { value: 'deep', label: 'Fundo roxo escuro' },
  { value: 'gold', label: 'Fundo dourado' },
];

const emptySection = {
  section_type: 'text',
  title: '',
  subtitle: '',
  body: '',
  image_url: '',
  cta_label: '',
  cta_url: '',
  secondary_label: '',
  secondary_url: '',
  visible: true,
  order: 0,
  item_limit: 3,
  background: 'light',
};

export default function SiteSectionsManager() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySection);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.HomeSection.filter({}, { sort: 'order', limit: 60 });
      setSections(page?.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptySection, order: sections.length });
  };

  const openEdit = (section) => {
    setEditing(section);
    setForm({ ...emptySection, ...section });
  };

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = {};
      Object.keys(emptySection).forEach((key) => {
        payload[key] = form[key];
      });
      if (editing) await base44.entities.HomeSection.update(editing.id, payload);
      else await base44.entities.HomeSection.create(payload);
      setEditing(null);
      setForm(emptySection);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (section) => {
    await base44.entities.HomeSection.update(section.id, { visible: !section.visible });
    await load();
  };

  const move = async (section, direction) => {
    const ordered = sections.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const index = ordered.findIndex((item) => item.id === section.id);
    const target = ordered[index + direction];
    if (!target) return;
    await Promise.all([
      base44.entities.HomeSection.update(section.id, { order: target.order ?? index + direction }),
      base44.entities.HomeSection.update(target.id, { order: section.order ?? index }),
    ]);
    await load();
  };

  const remove = async (section) => {
    await base44.entities.HomeSection.delete(section.id);
    await load();
  };

  const ordered = sections.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">
            Seções da página inicial
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Reordene, oculte, edite e crie novas seções. A página inicial do site passa a mostrar exatamente esta
            sequência.
          </p>
        </div>
        <Button onClick={openNew} className="rounded-full bg-brand-primary">
          <Plus className="mr-2 h-4 w-4" /> Nova seção
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-500">Carregando seções…</p>}
        {!loading && ordered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Nenhuma seção configurada. Crie a primeira seção para montar a página inicial.
          </p>
        )}
        {ordered.map((section, index) => (
          <div
            key={section.id}
            className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-4 ${
              section.visible ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-70'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-20 overflow-hidden rounded-lg bg-brand-soft">
                {section.image_url ? (
                  <Image src={section.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[0.65rem] uppercase tracking-[0.14em] text-slate-400">
                    {SECTION_TYPES.find((item) => item.value === section.section_type)?.label || 'Seção'}
                  </span>
                )}
              </div>
              <div>
                <p className="font-heading text-sm uppercase tracking-tight text-brand-deep">{section.title}</p>
                <p className="text-xs text-slate-500">
                  {SECTION_TYPES.find((item) => item.value === section.section_type)?.label || section.section_type}
                  {section.visible ? '' : ' • oculta'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => move(section, -1)}
                disabled={index === 0}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                aria-label="Mover para cima"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(section, 1)}
                disabled={index === ordered.length - 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                aria-label="Mover para baixo"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => toggleVisible(section)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500"
                aria-label={section.visible ? 'Ocultar seção' : 'Mostrar seção'}
              >
                {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => openEdit(section)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-primary hover:bg-brand-soft"
                aria-label="Editar seção"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(section)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                aria-label="Excluir seção"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={Boolean(form.title) || Boolean(editing) || form.section_type !== 'text' || Boolean(form.image_url)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setForm(emptySection);
          }
        }}
      >
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase tracking-tight">
              {editing ? 'Editar seção' : 'Nova seção'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Tipo de seção</Label>
              <select
                value={form.section_type}
                onChange={(event) => setForm((current) => ({ ...current, section_type: event.target.value }))}
                className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                {SECTION_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Fundo</Label>
              <select
                value={form.background}
                onChange={(event) => setForm((current) => ({ ...current, background: event.target.value }))}
                className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                {BACKGROUNDS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Título</Label>
              <Input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="mt-2"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Subtítulo</Label>
              <Input
                value={form.subtitle || ''}
                onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))}
                className="mt-2"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Texto / descrição da seção
              </Label>
              <Textarea
                value={form.body || ''}
                onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                rows={5}
                className="mt-2"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Imagem</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-20 w-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {form.image_url ? (
                    <Image src={form.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      sem imagem
                    </span>
                  )}
                </div>
                <label className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep">
                  Enviar imagem
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
                      setForm((current) => ({ ...current, image_url: file_url }));
                    }}
                  />
                </label>
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Botão principal</Label>
              <Input
                value={form.cta_label || ''}
                onChange={(event) => setForm((current) => ({ ...current, cta_label: event.target.value }))}
                placeholder="Texto do botão"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Link do botão principal</Label>
              <Input
                value={form.cta_url || ''}
                onChange={(event) => setForm((current) => ({ ...current, cta_url: event.target.value }))}
                placeholder="/eventos"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Botão secundário</Label>
              <Input
                value={form.secondary_label || ''}
                onChange={(event) => setForm((current) => ({ ...current, secondary_label: event.target.value }))}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Link do botão secundário</Label>
              <Input
                value={form.secondary_url || ''}
                onChange={(event) => setForm((current) => ({ ...current, secondary_url: event.target.value }))}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Quantidade de itens exibidos
              </Label>
              <Input
                type="number"
                value={form.item_limit ?? 3}
                onChange={(event) => setForm((current) => ({ ...current, item_limit: Number(event.target.value) }))}
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <span className="text-sm text-brand-deep">Seção visível no site</span>
              <Switch
                checked={Boolean(form.visible)}
                onCheckedChange={(checked) => setForm((current) => ({ ...current, visible: checked }))}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null);
                setForm(emptySection);
              }}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving || !form.title} className="rounded-full bg-brand-primary">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar seção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}