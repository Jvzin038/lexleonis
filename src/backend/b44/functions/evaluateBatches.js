import { createClientFromRequest } from "../sdk.js";
import { evaluateEventBatches } from "../shared/batchRotation.js";
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "evaluate");
    const eventId = String(body.event_id || "").trim();
    if (action === "evaluate") {
      if (!eventId)
        return Response.json({ error: "Informe o evento." }, { status: 400 });
      const result = await evaluateEventBatches(base44, eventId);
      return Response.json(result);
    }
    if (action === "evaluate_all") {
      const page = await base44.asServiceRole.entities.Event.filter({ status: { $in: ["published", "sold_out"] } }, { limit: 200, fields: ["id"] });
      const events = page?.items || [];
      const allChanges = [];
      for (const ev of events) {
        const result = await evaluateEventBatches(base44, ev.id);
        if (result.changes.length)
          allChanges.push({ event_id: ev.id, changes: result.changes });
      }
      return Response.json({ events_evaluated: events.length, changes: allChanges });
    }
    if (action === "manual") {
      if (!user)
        return Response.json({ error: "Entre na sua conta." }, { status: 401 });
      const batchId = String(body.batch_id || "").trim();
      if (!batchId)
        return Response.json({ error: "Informe o lote." }, { status: 400 });
      const batch = await base44.asServiceRole.entities.TicketType.get(batchId).catch(() => null);
      if (!batch)
        return Response.json({ error: "Lote não encontrado." }, { status: 404 });
      const updates = {};
      if (typeof body.active === "boolean")
        updates.active = body.active;
      if (body.name)
        updates.name = String(body.name).slice(0, 200);
      if (typeof body.price === "number")
        updates.price = body.price;
      if (typeof body.quantity_total === "number")
        updates.quantity_total = body.quantity_total;
      if (body.sales_start)
        updates.sales_start = String(body.sales_start).slice(0, 10);
      if (body.sales_end)
        updates.sales_end = String(body.sales_end).slice(0, 10);
      if (body.rotation_mode)
        updates.rotation_mode = String(body.rotation_mode);
      const updated = await base44.asServiceRole.entities.TicketType.update(batchId, updates);
      await base44.asServiceRole.entities.AdminLog.create({
        action: `Lote "${batch.name}" alterado manualmente`,
        module: "Ingressos",
        record_label: batch.name,
        user_email: user.email || "",
        user_name: user.full_name || "",
        details: JSON.stringify(updates)
      });
      return Response.json({ batch: updated });
    }
    return Response.json({ error: "Ação não reconhecida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
