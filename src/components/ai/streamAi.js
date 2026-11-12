import { supabase } from '@/integrations/supabase/client';

/** Calls the AI endpoint and reports the growing answer text through onText. */
export async function streamAi(payload, { onText, signal, auth = false } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (auth) {
    const { data } = await supabase.auth.getSession();
    if (data.session) headers.authorization = `Bearer ${data.session.access_token}`;
  }
  const res = await fetch('/api/public/ai', { method: 'POST', headers, body: JSON.stringify(payload), signal });
  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'O assistente não respondeu agora.');
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onText?.(text);
  }
  return text;
}
