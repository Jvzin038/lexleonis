import { createClientFromRequest } from "../sdk.js";
import { requirePermission } from "../shared/staffAuth.js";
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const access = await requirePermission(base44, user, "checkin");
    if (!access.ok) {
      return Response.json({ error: "Sua conta não tem permissão para a portaria." }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const eventId = String(body.event_id || "").trim();
    if (!eventId)
      return Response.json({ error: "Selecione o evento." }, { status: 400 });
    const [issued, used, valid, expired, refusals, entries] = await Promise.all([
      base44.asServiceRole.entities.Ticket.count({ event_id: eventId }),
      base44.asServiceRole.entities.Ticket.count({ event_id: eventId, status: "used" }),
      base44.asServiceRole.entities.Ticket.count({ event_id: eventId, status: "valid" }),
      base44.asServiceRole.entities.Ticket.count({ event_id: eventId, status: "expired" }),
      base44.asServiceRole.entities.CheckInLog.count({ event_id: eventId, result: { $ne: "ok" } }),
      base44.asServiceRole.entities.CheckInLog.filter({ event_id: eventId }, { sort: "-created_date", limit: 12 })
    ]);
    const search = String(body.search || "").trim();
    let participants = [];
    if (search) {
      const page = await base44.asServiceRole.entities.Ticket.filter({
        event_id: eventId,
        $or: [
          { code: { $regex: search, $options: "i" } },
          { holder_name: { $regex: search, $options: "i" } }
        ]
      }, { sort: "holder_name", limit: 20 });
      participants = page?.items || [];
    }
    const lastOk = (entries?.items || []).filter((entry) => entry.result === "ok");
    return Response.json({
      stats: {
        issued,
        used,
        valid,
        expired,
        refusals,
        cancelled: Math.max(0, issued - used - valid - expired)
      },
      last_entries: entries?.items || [],
      last_ok_at: lastOk[0]?.created_date || "",
      participants
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
