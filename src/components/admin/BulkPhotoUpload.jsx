import React, { useState } from 'react';
import { Loader2, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';

export default function BulkPhotoUpload({ albums, onDone }) {
  const [albumId, setAlbumId] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [finished, setFinished] = useState(0);
  const [error, setError] = useState('');

  const handleSelect = (event) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length === 0) return;
    setFiles(selected);
    setPreviews(selected.map((file) => URL.createObjectURL(file)));
    setError('');
    setFinished(0);
  };

  const removeFile = (index) => {
    setFiles((current) => current.filter((_, i) => i !== index));
    setPreviews((current) => {
      URL.revokeObjectURL(current[index]);
      return current.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (!albumId) {
      setError('Selecione um álbum antes de enviar.');
      return;
    }
    if (files.length === 0) {
      setError('Selecione ao menos uma foto.');
      return;
    }

    setUploading(true);
    setError('');
    setProgress({ done: 0, total: files.length });
    setFinished(0);

    // 1. Sobe todas as imagens primeiro, coletando as URLs
    const urls = [];
    let uploadErrors = 0;

    for (let i = 0; i < files.length; i++) {
      try {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: files[i] });
        urls.push(file_url);
      } catch (uploadError) {
        uploadErrors++;
      }
      setProgress({ done: i + 1, total: files.length });
    }

    // 2. Cria todos os registros de uma vez via bulkCreate
    let success = 0;
    if (urls.length > 0) {
      try {
        const records = urls.map((url, index) => ({
          album_id: albumId,
          url,
          order: index,
        }));
        const result = await base44.entities.GalleryImage.bulkCreate(records);
        success = Array.isArray(result) ? result.length : (result?.records?.length || urls.length);
      } catch (bulkError) {
        setError(bulkError?.message || 'Falha ao salvar as fotos no álbum.');
      }
    } else if (uploadErrors > 0) {
      setError('Não foi possível enviar nenhuma foto. Tente novamente.');
    }

    setUploading(false);
    setFinished(success);

    // limpa seleção
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setFiles([]);
    setPreviews([]);

    if (success > 0 && onDone) onDone();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[220px] flex-1">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Álbum *</label>
          <select
            value={albumId}
            onChange={(event) => setAlbumId(event.target.value)}
            disabled={uploading}
            className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">Selecione um álbum…</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            multiple
            id="bulk-photo-input"
            className="hidden"
            disabled={uploading}
            onChange={handleSelect}
          />
          <label
            htmlFor="bulk-photo-input"
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-deep ${uploading ? 'opacity-50' : 'hover:bg-brand-soft'}`}
          >
            <Upload className="h-4 w-4" />
            Selecionar fotos
          </label>
        </div>
        <div>
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0 || !albumId}
            className="rounded-full bg-brand-primary"
          >
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {uploading ? 'Enviando…' : `Enviar ${files.length || ''} ${files.length === 1 ? 'foto' : 'fotos'}`}
          </Button>
        </div>
      </div>

      {uploading && (
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
          Enviando {progress.done} de {progress.total}…
        </div>
      )}

      {!uploading && finished > 0 && (
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          {finished} {finished === 1 ? 'foto enviada' : 'fotos enviadas'} com sucesso.
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {files.length} {files.length === 1 ? 'foto selecionada' : 'fotos selecionadas'}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
                <Image src={preview} alt="" className="h-full w-full object-cover" />
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600"
                    aria-label="Remover"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}