import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

// Runs one of the app's backend actions (ported from the original project).
// The caller may be signed out: each action checks permissions itself.
export const invokeAction = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ name: z.string().min(1).max(64), payload: z.any().optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { FUNCTIONS } = await import("./b44/registry.js");
    const { bindRequestContext, loadUser } = await import("./b44/sdk.js");
    const fn = (FUNCTIONS as Record<string, (req: Request) => Promise<Response>>)[data.name];
    if (!fn) return { status: 404, body: JSON.stringify({ error: "Ação não encontrada." }) };

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
    // Returned as text so any JSON shape the action produces passes through unchanged.
    return { status: res.status, body: await res.text() };
  });
