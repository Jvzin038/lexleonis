import { createClientFromRequest } from "../sdk.js";
import { requirePermission } from "../shared/staffAuth.js";
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const access = await requirePermission(base44, user, "ingressos");
    if (!access.ok) {
      return Response.json({ error: "Sua conta não tem permissão para ver os ingressos emitidos." }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "list");
    if (action === "detail") {
      const id = String(body.id || "").trim();
      if (!id)
        return Response.json({ error: "Informe o ingresso." }, { status: 400 });
      const ticket = await base44.asServiceRole.entities.Ticket.get(id).catch(() => null);
      if (!ticket)
        return Response.json({ error: "Ingresso não encontrado." }, { status: 404 });
      const logs = await base44.asServiceRole.entities.CheckInLog.filter({
        $or: [{ ticket_id: ticket.id }, { ticket_code: ticket.code }]
      }, { sort: "-created_date", limit: 50 });
      return Response.json({ ticket, history: logs?.items || [] });
    }
    const baseQuery = {};
    if (body.event_id)
      baseQuery.event_id = String(body.event_id);
    const query = { ...baseQuery };
    if (body.status)
      query.status = String(body.status);
    if (body.payment_status)
      query.payment_status = String(body.payment_status);
    const search = String(body.search || "").trim();
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { holder_name: { $regex: search, $options: "i" } },
        { order_number: { $regex: search, $options: "i" } }
      ];
    }
    const [page, byStatus, byPayment] = await Promise.all([
      base44.asServiceRole.entities.Ticket.filter(query, { sort: "-issued_at", limit: 300 }),
      base44.asServiceRole.entities.Ticket.aggregate({ query: baseQuery, groupBy: "status" }),
      base44.asServiceRole.entities.Ticket.aggregate({ query: baseQuery, groupBy: "payment_status" })
    ]);
    return Response.json({
      items: page?.items || [],
      counts: { status: byStatus?.rows || [], payment: byPayment?.rows || [] }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
