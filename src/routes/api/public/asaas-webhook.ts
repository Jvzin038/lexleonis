import { createFileRoute } from "@tanstack/react-router";

// Asaas PIX webhook. The handler verifies the asaas-access-token header against ASAAS_WEBHOOK_TOKEN.
export const Route = createFileRoute("/api/public/asaas-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { bindRequestContext } = await import("@/backend/b44/sdk.js");
        const { default: handler } = await import("@/backend/b44/functions/asaasWebhook.js");
        bindRequestContext(request, { admin: supabaseAdmin, user: null, origin: new URL(request.url).origin });
        return handler(request);
      },
    },
  },
});
