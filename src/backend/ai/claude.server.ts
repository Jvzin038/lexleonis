// Streams a Claude reply through the Lovable AI Gateway and re-emits only the answer text.
const GATEWAY = "https://ai.gateway.lovable.dev/v1/messages";
export const CLAUDE_MODEL = "anthropic/claude-sonnet-5";

export type ChatMsg = { role: "user" | "assistant"; content: string };

export async function streamClaude(opts: { system: string; messages: ChatMsg[]; maxTokens?: number; signal?: AbortSignal }): Promise<Response> {
  const key = process.env['LOVABLE_API_KEY'];
  if (!key) return Response.json({ error: "Assistente de IA não configurado." }, { status: 500 });
  const upstream = await fetch(GATEWAY, {
    method: "POST",
    signal: opts.signal ?? null,
    headers: { "content-type": "application/json", authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: opts.maxTokens ?? 4000,
      system: opts.system,
      messages: opts.messages,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      stream: true,
    }),
  });
  if (!upstream.ok || !upstream.body) {
    let message = "O assistente não respondeu agora. Tente novamente em instantes.";
    if (upstream.status === 402) message = "Os créditos de IA do projeto acabaram. Avise a diretoria.";
    if (upstream.status === 429) message = "Muitas perguntas ao mesmo tempo. Aguarde um pouco e tente de novo.";
    if (upstream.status === 403) message = "O assistente está indisponível no momento.";
    console.error("AI gateway error", upstream.status, (await upstream.text().catch(() => "")).slice(0, 300));
    return Response.json({ error: message }, { status: upstream.status });
  }
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() || "";
      for (const frame of frames) {
        const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        try {
          const evt = JSON.parse(dataLine.slice(5).trim());
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") controller.enqueue(encoder.encode(evt.delta.text));
          if (evt.type === "message_delta" && evt.delta?.stop_reason === "refusal") controller.enqueue(encoder.encode("\n\n_Não posso ajudar com esse pedido._"));
          if (evt.type === "error") controller.enqueue(encoder.encode("\n\n_O assistente foi interrompido. Tente novamente._"));
        } catch { /* partial or non-JSON frame */ }
      }
    },
  });
  return new Response(upstream.body.pipeThrough(transform), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-cache, no-transform" },
  });
}
