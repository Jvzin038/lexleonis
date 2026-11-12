import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, Send, Square, X } from 'lucide-react';
import { streamAi } from './streamAi';

const WELCOME = { role: 'assistant', content: 'Olá! Sou o **Leão**, assistente da Lex Leonis. Pergunte sobre eventos, ingressos ou a loja.' };
const SUGGESTIONS = ['Quais são os próximos eventos?', 'Como compro um ingresso?', 'O que tem na loja?'];

export default function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages]);
  useEffect(() => { if (open && !busy) inputRef.current?.focus(); }, [open, busy]);

  async function send(text) {
    const question = text.trim();
    if (!question || busy) return;
    const history = [...messages.slice(1), { role: 'user', content: question }].slice(-19);
    setMessages((m) => [...m, { role: 'user', content: question }, { role: 'assistant', content: '', pending: true }]);
    setInput('');
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const update = (content, extra = {}) => setMessages((m) => [...m.slice(0, -1), { role: 'assistant', content, ...extra }]);
    try {
      const final = await streamAi({ mode: 'assistant', messages: history }, { signal: ctrl.signal, onText: (t) => update(t, { pending: true }) });
      update(final || 'Não consegui responder agora.');
    } catch (error) {
      if (ctrl.signal.aborted) setMessages((m) => { const last = m[m.length - 1]; return [...m.slice(0, -1), { role: 'assistant', content: (last.content || '') + '\n\n_Resposta interrompida._' }]; });
      else update(`_${error.message}_`);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-brand-deep/10 bg-white shadow-2xl" role="dialog" aria-label="Assistente da Lex Leonis">
          <div className="flex items-center justify-between bg-brand-deep px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold font-display text-sm font-bold text-brand-ink">LL</span>
              <div><p className="text-sm font-semibold">Leão</p><p className="text-xs text-white/60">Assistente da atlética</p></div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar assistente" className="rounded-full p-1.5 hover:bg-white/10"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'ml-8 rounded-2xl rounded-br-sm bg-brand-deep px-3.5 py-2 text-sm text-white' : 'mr-4 text-sm text-slate-700'}>
                {m.pending && !m.content ? (
                  <span className="inline-flex gap-1 py-2" aria-label="Digitando"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" /></span>
                ) : (
                  <div className="ai-prose"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                )}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-brand-deep/15 px-3 py-1.5 text-xs text-brand-deep hover:bg-brand-soft">{s}</button>)}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 border-t border-slate-100 p-3">
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }} rows={1} maxLength={2000} placeholder="Escreva sua pergunta…" className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-primary" />
            {busy ? (
              <button type="button" onClick={() => abortRef.current?.abort()} aria-label="Parar resposta" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700"><Square className="h-4 w-4" /></button>
            ) : (
              <button type="submit" disabled={!input.trim()} aria-label="Enviar pergunta" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold text-brand-ink disabled:opacity-40"><Send className="h-4 w-4" /></button>
            )}
          </form>
        </div>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Fechar assistente' : 'Abrir assistente'} className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold text-brand-ink shadow-xl transition hover:scale-105">
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
