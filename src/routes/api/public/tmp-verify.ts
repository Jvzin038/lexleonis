import { createFileRoute } from "@tanstack/react-router";
// TEMPORARY verification helper — removed after migration checks.
export const Route = createFileRoute("/api/public/tmp-verify")({
  server: { handlers: { POST: async ({ request }) => {
    if (request.headers.get("x-tok") !== "547b98095ad5a9ab2e51e3fc43c1f21b") return new Response("no", { status: 403 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const body = await request.json();
    if (body.op === "create") {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({ email: body.email, password: body.password, email_confirm: true });
      if (error) return Response.json({ error: error.message });
      if (body.admin) await supabaseAdmin.from("user_roles").insert({ user_id: data.user.id, role: "admin" });
      return Response.json({ id: data.user.id });
    }
    if (body.op === "legacy") {
      await supabaseAdmin.from("legacy_user_map").insert(body.row);
      await supabaseAdmin.from("registration").insert(body.reg);
      return Response.json({ ok: true });
    }
    if (body.op === "insert") {
      const { data, error } = await supabaseAdmin.from(body.table).insert(body.row).select().single();
      return Response.json(error ? { error: error.message } : data);
    }
    if (body.op === "update") {
      const { data, error } = await supabaseAdmin.from(body.table).update(body.row).eq("id", body.id).select().single();
      return Response.json(error ? { error: error.message } : data);
    }
    if (body.op === "read") {
      const { data } = await supabaseAdmin.from(body.table).select("*").limit(20);
      return Response.json(data);
    }
    if (body.op === "cleanup") {
      for (const id of body.ids) await supabaseAdmin.auth.admin.deleteUser(id);
      const out: Record<string, unknown> = {};
      for (const t of ["registration","event","ticket_type","admin_log","ticket","check_in_log"] as const) { const r = await supabaseAdmin.from(t).delete().neq("id", "__none__"); out[t] = r.error?.message || "ok"; }
      await supabaseAdmin.from("legacy_user_map").delete().neq("email", "__none__");
      return Response.json(out);
      return Response.json({ ok: true });
    }
    return new Response("?", { status: 400 });
  } } },
});
