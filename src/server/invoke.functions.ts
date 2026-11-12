import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

// Runs one of the app's backend actions (ported from the original project).
// The caller may be signed out: each action checks permissions itself.
export const invokeAction = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ name: z.string().min(1).max(64), payload: z.any().optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // @ts-expect-error untyped JS module
    const { FUNCTIONS } = await import("./b44/registry.js");
    // @ts-expect-error untyped JS module
    const { bindRequestContext, loadUser } = await import("./b44/sdk.js");
    const fn = FUNCTIONS[data.name];
    if (!fn) return { status: 404, data: { error: "Ação não encontrada." } };

    const request = getRequest();
    const authHeader = request?.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    let user = null;
    if (token) {
      const { data: authData } = await supabaseAdmin.auth.getUser(token);
      if (authData?.user) user = await loadUser(supabaseAdmin, authData.user.id);
    }
    const origin = new URL(request?.url || "http://localhost").origin;
    const req = new Request(`${origin}/functions/${data.name}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: request?.headers.get("host") || "",
        "x-forwarded-host": request?.headers.get("x-forwarded-host") || request?.headers.get("host") || "",
        "x-forwarded-proto": request?.headers.get("x-forwarded-proto") || "https",
      },
      body: JSON.stringify(data.payload ?? {}),
    });
    bindRequestContext(req, { admin: supabaseAdmin, user, origin });
    const res: Response = await fn(req);
    const text = await res.text();
    let body: unknown = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
    return { status: res.status, data: body as Record<string, unknown> };
  });
