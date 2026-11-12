import { createFileRoute } from "@tanstack/react-router";

// Asaas PIX webhook. The handler verifies the asaas-access-token header against ASAAS_WEBHOOK_TOKEN.
export const Route = createFileRoute("/api/public/asaas-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        // @ts-expect-error untyped JS module
        const { bindRequestContext } = await import("@/server/b44/sdk.js");
        // @ts-expect-error untyped JS module
        const { default: handler } = await import("@/server/b44/functions/asaasWebhook.js");
        bindRequestContext(request, { admin: supabaseAdmin, user: null, origin: new URL(request.url).origin });
        return handler(request);
      },
    },
  },
});
