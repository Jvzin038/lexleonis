import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Square, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { streamAi } from '@/components/ai/streamAi';
import { useStaff } from '@/lib/useStaff';

function Output({ text, busy }) {
  if (!text && !busy) return null;
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{busy ? 'Escrevendo…' : 'Resultado'}</p>
        {!busy && text && <Button variant="outline" size="sm" className="rounded-full" onClick={() => { navigator.clipboard.writeText(text); toast.success('Texto copiado.'); }}><Copy className="mr-1 h-3.5 w-3.5" />Copiar</Button>}
      </div>
      <div className="prose prose-sm max-w-none"><ReactMarkdown>{text || '…'}</ReactMarkdown></div>
    </div>
  );
}

function useRun() {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  async function run(payload) {
    const ctrl = new AbortController(); ref.current = ctrl;
    setText(''); setBusy(true);
    try { await streamAi(payload, { auth: true, signal: ctrl.signal, onText: setText }); }
    catch (e) { if (!ctrl.signal.aborted) toast.error(e.message); }
    finally { setBusy(false); }
  }
  return { text, busy, run, stop: () => ref.current?.abort() };
}

const Pill = ({ active, ...p }) => <button type="button" {...p} className={`rounded-full px-4 py-2 text-sm font-medium ${active ? 'bg-brand-deep text-white' : 'bg-white text-brand-deep border border-slate-200'}`} />;

function Writer({ canNews, canEvents }) {
  const kinds = [canNews && ['news', 'Notícia'], canEvents && ['event', 'Descrição de evento'], canNews && ['instagram', 'Legenda de Instagram']].filter(Boolean);
  const [kind, setKind] = useState(kinds[0]?.[0]);
  const [tone, setTone] = useState('animado');
  const [topic, setTopic] = useState('');
  const { text, busy, run, stop } = useRun();
  if (!kinds.length) return <p className="text-sm text-slate-500">Seu perfil não tem permissão para notícias ou eventos.</p>;
  return (
    <div>
      <div className="flex flex-wrap gap-2">{kinds.map(([k, l]) => <Pill key={k} active={kind === k} onClick={() => setKind(k)}>{l}</Pill>)}</div>
      <Textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={6} maxLength={3000} className="mt-4 bg-white" placeholder="Ex.: Calourada dia 20/12 às 20h no Campus, ingresso gratuito, open bar de refrigerante, levar documento…" />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select value={tone} onChange={(e) => setTone(e.target.value)} className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm" aria-label="Tom do texto">
          <option value="animado">Tom animado</option><option value="informativo">Tom informativo</option><option value="formal">Tom formal</option>
        </select>
        {busy ? <Button variant="outline" className="rounded-full" onClick={stop}><Square className="mr-2 h-4 w-4" />Parar</Button>
          : <Button className="rounded-full bg-brand-primary" disabled={topic.trim().length < 3} onClick={() => run({ mode: 'writer', kind, topic, tone })}><Wand2 className="mr-2 h-4 w-4" />Gerar texto</Button>}
      </div>
      <Output text={text} busy={busy} />
    </div>
  );
}

function Summary() {
  const [days, setDays] = useState(30);
  const { text, busy, run, stop } = useRun();
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {[[30, 'Últimos 30 dias'], [90, 'Últimos 90 dias'], [365, 'Últimos 12 meses']].map(([d, l]) => <Pill key={d} active={days === d} onClick={() => setDays(d)}>{l}</Pill>)}
        {busy ? <Button variant="outline" className="ml-auto rounded-full" onClick={stop}><Square className="mr-2 h-4 w-4" />Parar</Button>
          : <Button className="ml-auto rounded-full bg-brand-primary" onClick={() => run({ mode: 'summary', days })}><Wand2 className="mr-2 h-4 w-4" />Gerar resumo</Button>}
      </div>
      <p className="mt-3 text-sm text-slate-500">A IA analisa inscrições, vendas da loja, estoque e próximos eventos e sugere ações para a diretoria.</p>
      <Output text={text} busy={busy} />
    </div>
  );
}

export default function AdminAssistente() {
  const { permissions = [] } = useStaff();
  const has = (p) => permissions.includes('*') || permissions.includes(p);
  const [tab, setTab] = useState('writer');
  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="font-display text-2xl text-brand-ink">Assistente de IA</h2>
      <p className="mt-1 text-sm text-slate-500">Gere textos para o site e redes sociais e peça um resumo dos números da atlética. Sempre revise antes de publicar.</p>
      <div className="mt-6 flex gap-2">
        <Pill active={tab === 'writer'} onClick={() => setTab('writer')}>Redator</Pill>
        {has('dashboard') && <Pill active={tab === 'summary'} onClick={() => setTab('summary')}>Resumo do painel</Pill>}
      </div>
      <div className="mt-6">{tab === 'writer' ? <Writer canNews={has('noticias')} canEvents={has('eventos')} /> : <Summary />}</div>
    </div>
  );
}
