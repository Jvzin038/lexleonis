import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Links an imported (pre-migration) account to the signed-in user, only after the
// email address is verified and matches exactly one imported record.
export const claimLegacyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const user = authData?.user;
    if (!user?.email || !user.email_confirmed_at) return { linked: false };
    const email = user.email.toLowerCase();
    const { data: rows } = await supabaseAdmin
      .from("legacy_user_map")
      .select("*")
      .ilike("email", email);
    const matches = (rows || []).filter((r) => !r.auth_user_id || r.auth_user_id === user.id);
    if (matches.length !== 1) return { linked: false };
    const legacy = matches[0]!;
    if (legacy.auth_user_id === user.id) return { linked: true };
    const oldId = legacy.base44_user_id;
    const newId = user.id;
    for (const table of ["registration", "ticket", "store_order", "order_item", "staff_profile"] as const) {
      await supabaseAdmin.from(table).update({ user_id: newId }).eq("user_id", oldId);
    }
    if (legacy.role === "admin") {
      await supabaseAdmin.from("user_roles").upsert({ user_id: newId, role: "admin" }, { onConflict: "user_id,role" });
    }
    const extra = (legacy.data as Record<string, unknown>) || {};
    await supabaseAdmin
      .from("profiles")
      .update({
        full_name: legacy.full_name || undefined,
        phone: (extra["phone"] as string) || undefined,
        cpf: (extra["cpf"] as string) || undefined,
        course: (extra["course"] as string) || undefined,
        data: extra as never,
      })
      .eq("id", newId);
    await supabaseAdmin
      .from("legacy_user_map")
      .update({ auth_user_id: newId, linked_at: new Date().toISOString() })
      .eq("base44_user_id", oldId);
    return { linked: true };
  });
