import React, { useEffect, useState } from 'react';
import { Copy, Loader2, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Image } from '@/components/ui/image';

function FieldControl({ field, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleUpload = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError('');
    try {
      if (field.type === 'images') {
        const urls = [];
        for (const file of files) {
          const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
          urls.push(file_url);
        }
        onChange([...(Array.isArray(value) ? value : []), ...urls]);
      } else {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: files[0] });
        onChange(file_url);
      }
    } catch (uploadError) {
      setUploadError(uploadError?.message || 'Falha no upload. Tente uma imagem menor.');
    } finally {
      setUploading(false);
    }
  };

  switch (field.type) {
    case 'textarea':
      return <Textarea value={value ?? ''} onChange={(event) => onChange(event.target.value)} rows={field.rows || 4} />;
    case 'number':
      return (
        <Input
          type="number"
          step={field.step || 1}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
        />
      );
    case 'date':
      return <Input type="date" value={value ? String(value).slice(0, 10) : ''} onChange={(event) => onChange(event.target.value)} />;
    case 'time':
      return <Input type="time" value={value ? String(value).slice(0, 5) : ''} onChange={(event) => onChange(event.target.value)} />;
    case 'select':
      return (
        <select
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">Selecione…</option>
          {(field.options || []).map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>
      );
    case 'switch':
      return <Switch checked={Boolean(value)} onCheckedChange={onChange} />;
    case 'choices': {
      const optionValues = (field.options || []).map((option) => option.value ?? option);
      const selected = Array.isArray(value) ? value : [];
      const toggle = (optionValue) => {
        if (selected.includes(optionValue)) {
          onChange(selected.filter((item) => item !== optionValue));
          return;
        }
        onChange(optionValues.filter((item) => item === optionValue || selected.includes(item)));
      };
      return (
        <div className="flex flex-wrap gap-2">
          {(field.options || []).map((option) => {
            const optionValue = option.value ?? option;
            const isActive = selected.includes(optionValue);
            return (
              <button
                key={optionValue}
                type="button"
                onClick={() => toggle(optionValue)}
                aria-pressed={isActive}
                className={`min-w-14 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border-brand-deep bg-brand-deep text-white'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                {option.label ?? optionValue}
              </button>
            );
          })}
        </div>
      );
    }
    case 'image':
      return (
        <div>
          <div className="flex items-center gap-4">
            <div className="h-20 w-28 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {value ? (
                <Image src={value} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs text-slate-400">sem imagem</span>
              )}
            </div>
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep ${uploading ? 'opacity-50' : ''}`}
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading ? 'Enviando…' : 'Enviar'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(event) => handleUpload(event.target.files)}
              />
            </label>
            {value && !uploading && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-600"
              >
                <X className="h-3.5 w-3.5" /> Remover
              </button>
            )}
          </div>
          {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
        </div>
      );
    case 'images':
      return (
        <div>
          <div className="flex flex-wrap gap-3">
            {(Array.isArray(value) ? value : []).map((url, index) => (
              <div key={`${url}-${index}`} className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
                <Image src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, position) => position !== index))}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600"
                  aria-label="Remover imagem"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <label className={`flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 ${uploading ? 'border-brand-primary text-brand-primary' : 'text-slate-400'}`}>
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(event) => handleUpload(event.target.files)}
              />
            </label>
          </div>
          {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
        </div>
      );
    case 'relation':
      return (
        <select
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">Selecione…</option>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    default:
      return <Input value={value ?? ''} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} />;
  }
}

export default function EntityManager({
  title,
  subtitle,
  entity,
  fields = [],
  columns = [],
  defaults = {},
  sort = '-created_date',
  listQuery = {},
  searchField,
  searchPlaceholder = 'Buscar…',
  emptyMessage = 'Nenhum registro cadastrado ainda.',
  allowCreate = true,
  allowDuplicate = false,
  rowActions,
  headerExtra,
  transform,
  onDataChange,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const query = { ...listQuery };
      if (search && searchField) query[searchField] = { $regex: search, $options: 'i' };
      const page = await base44.entities[entity].filter(query, { sort, limit: 200 });
      setItems(page?.items || []);
    } catch (loadError) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, sort, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaults });
    setError('');
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ ...row });
    setError('');
    setFormOpen(true);
  };

  const openDuplicate = (row) => {
    const copy = { ...row, ...defaults };
    delete copy.id;
    delete copy.created_date;
    delete copy.updated_date;
    delete copy.created_by_id;
    setEditing(null);
    setForm(copy);
    setError('');
    setFormOpen(true);
  };

  const persist = async () => {
    const missing = fields.filter((field) => field.required && !String(form[field.name] ?? '').trim());
    if (missing.length > 0) {
      setError(`Preencha: ${missing.map((field) => field.label).join(', ')}.`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {};
      fields.forEach((field) => {
        payload[field.name] =
          form[field.name] ?? (field.type === 'switch' ? false : field.type === 'choices' ? [] : '');
      });
      Object.entries(defaults).forEach(([key, value]) => {
        if (payload[key] === undefined || payload[key] === '') payload[key] = value;
      });

      const finalPayload = transform ? transform(payload, editing) : payload;

      // Limpa campos: remove strings vazias para campos numéricos e datas, evitando rejeição da API
      const cleanPayload = {};
      Object.entries(finalPayload).forEach(([key, value]) => {
        const fieldDef = fields.find((f) => f.name === key);
        const isNumber = fieldDef?.type === 'number';
        const isDate = fieldDef?.type === 'date';
        if (value === '' && (isNumber || isDate)) return; // não envia vazio para número/data
        if (isNumber && value !== undefined && value !== null) {
          cleanPayload[key] = Number(value);
        } else {
          cleanPayload[key] = value;
        }
      });

      if (editing) {
        await base44.entities[entity].update(editing.id, cleanPayload);
      } else {
        await base44.entities[entity].create(cleanPayload);
      }
      setFormOpen(false);
      await load();
    } catch (saveError) {
      setError(saveError?.message || 'Não foi possível salvar. Revise os campos e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await base44.entities[entity].delete(pendingDelete.id);
      setPendingDelete(null);
      await load();
    } catch (deleteError) {
      setError(deleteError?.message || 'Não foi possível excluir. Tente novamente.');
      setPendingDelete(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">{title}</h2>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {headerExtra}
          {allowCreate && (
            <Button onClick={openCreate} className="rounded-full bg-brand-primary">
              <Plus className="mr-2 h-4 w-4" /> Novo
            </Button>
          )}
        </div>
      </div>

      {searchField && (
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      <div className="table-scroll mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-brand-soft">
            <tr className="text-left font-heading text-[0.7rem] uppercase tracking-[0.14em] text-brand-deep">
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading &&
              items.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 align-top">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-slate-600">
                      {column.render ? column.render(row) : row[column.key] || '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {rowActions?.(row)}
                      {allowDuplicate && (
                        <button
                          type="button"
                          onClick={() => openDuplicate(row)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                          aria-label="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-primary hover:bg-brand-soft"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(row)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase tracking-tight">
              {editing ? `Editar ${title.toLowerCase()}` : `Novo registro — ${title}`}
            </DialogTitle>
            <DialogDescription>Preencha os campos e salve para publicar no site.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className={field.colSpan === 2 ? 'sm:col-span-2' : ''}>
                <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {field.label}
                  {field.required ? ' *' : ''}
                </Label>
                <div className="mt-2">
                  <FieldControl
                    field={field}
                    value={form[field.name]}
                    onChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))}
                  />
                </div>
                {field.help && <p className="mt-1 text-xs text-slate-400">{field.help}</p>}
              </div>
            ))}
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setFormOpen(false)} className="rounded-full">
              Cancelar
            </Button>
            <Button onClick={persist} disabled={saving} className="rounded-full bg-brand-primary">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove o registro permanentemente. Confirme apenas se tiver certeza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}