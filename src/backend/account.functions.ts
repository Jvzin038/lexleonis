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
    const { encryptCpf } = await import("./b44/shared/cpfCrypto.js");
    const extra = ((legacy.data as Record<string, unknown>) || {}) as Record<string, string | undefined>;
    // O CPF vai criptografado para a coluna própria e não fica aberto no campo data.
    const { cpf: legacyCpf, ...extraWithoutCpf } = extra;
    const patch: { full_name?: string; phone?: string; cpf?: string; course?: string; data: Record<string, unknown> } = { data: extraWithoutCpf };
    if (legacy.full_name) patch.full_name = legacy.full_name;
    if (extra["phone"]) patch.phone = extra["phone"];
    if (legacyCpf) patch.cpf = encryptCpf(legacyCpf);
    if (extra["course"]) patch.course = extra["course"];
    await supabaseAdmin.from("profiles").update(patch as never).eq("id", newId);
    await supabaseAdmin
      .from("legacy_user_map")
      .update({ auth_user_id: newId, linked_at: new Date().toISOString() })
      .eq("base44_user_id", oldId);
    return { linked: true };
  });
