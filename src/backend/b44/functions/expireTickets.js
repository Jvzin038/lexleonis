import { createClientFromRequest } from "../sdk.js";
import { requirePermission } from "../shared/staffAuth.js";
import { eventWindow } from "../shared/ticketRules.js";
import { fetchSettings, releaseQuantity } from "../shared/ticketIssue.js";
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const access = await requirePermission(base44, user, "ingressos");
    if (!access.ok && user.role !== "admin") {
      return Response.json({ error: "Sua conta não tem permissão para atualizar a validade." }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const eventId = String(body.event_id || "").trim();
    const settings = await fetchSettings(base44);
    let events;
    if (eventId) {
      const event = await base44.asServiceRole.entities.Event.get(eventId).catch(() => null);
      events = event ? [event] : [];
    } else {
      const page = await base44.asServiceRole.entities.Event.filter({ status: { $ne: "draft" } }, { sort: "-start_date", limit: 200 });
      events = page?.items || [];
    }
    const now = Date.now();
    let expired = 0;
    let processed = 0;
    for (const event of events) {
      const window = eventWindow(event, settings);
      if (!window.validUntil || now <= window.validUntil.getTime())
        continue;
      processed += 1;
      const page = await base44.asServiceRole.entities.Ticket.filter({ event_id: event.id, status: "valid" }, { limit: 200 });
      const pending = (page?.items || []).filter((ticket) => !ticket.valid_until || new Date(ticket.valid_until).getTime() <= now);
      if (pending.length === 0)
        continue;
      await base44.asServiceRole.entities.Ticket.bulkUpdate(pending.map((ticket) => ({ id: ticket.id, status: "expired" })));
      expired += pending.length;
    }
    if (expired > 0) {
      await base44.asServiceRole.entities.AdminLog.create({
        action: "Validade dos ingressos atualizada",
        module: "Ingressos",
        record_label: eventId || "Todos os eventos encerrados",
        user_email: user.email || "",
        user_name: user.full_name || "",
        details: `${expired} ingresso(s) marcado(s) como expirado(s).`
      });
    }
    const nowIso = new Date().toISOString();
    const pendingPage = await base44.asServiceRole.entities.Registration.filter({ status: "awaiting_payment", reservation_expires_at: { $lt: nowIso } }, { limit: 200 });
    let cancelledOrders = 0;
    for (const reg of pendingPage?.items || []) {
      if (reg.ticket_type_id && reg.quantity) {
        await releaseQuantity(base44, reg.ticket_type_id, Math.max(1, Number(reg.quantity || 1)));
      }
      await base44.asServiceRole.entities.Registration.update(reg.id, {
        status: "cancelled",
        payment_status: "cancelled"
      });
      cancelledOrders += 1;
    }
    if (cancelledOrders > 0) {
      await base44.asServiceRole.entities.AdminLog.create({
        action: "Reservas expiradas canceladas",
        module: "Ingressos",
        record_label: eventId || "Limpeza automática",
        user_email: user.email || "",
        user_name: user.full_name || "",
        details: `${cancelledOrders} pedido(s) pendente(s) com reserva expirada cancelado(s).`
      });
    }
    return Response.json({ expired, cancelled_orders: cancelledOrders, events_checked: processed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
