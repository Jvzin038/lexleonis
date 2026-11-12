import { createClientFromRequest } from "../sdk.js";
import { hasPermission, requirePermission } from "../shared/staffAuth.js";
import { issueTicketsForRegistration, releaseQuantity, revokeTicketsForRegistration } from "../shared/ticketIssue.js";
const PERMISSION = "ingressos";
async function writeLog(base44, user, action, order, details) {
  await base44.asServiceRole.entities.AdminLog.create({
    action,
    module: "Ingressos",
    record_label: order?.order_number || order?.id || "",
    user_email: user.email || "",
    user_name: user.full_name || "",
    details: details || ""
  });
}
async function loadTickets(base44, orderId) {
  const page = await base44.asServiceRole.entities.Ticket.filter({ registration_id: orderId }, { limit: 200 });
  return page?.items || [];
}
async function loadHistory(base44, order) {
  const page = await base44.asServiceRole.entities.AdminLog.filter({ module: "Ingressos", record_label: order.order_number || order.id }, { sort: "-created_date", limit: 50 });
  return page?.items || [];
}
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const access = await requirePermission(base44, user, PERMISSION);
    const allowed = access.ok || hasPermission(access.context?.permissions || [], "inscricoes");
    if (!allowed) {
      return Response.json({ error: "Sua conta não tem permissão para gerenciar ingressos e pedidos." }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "list");
    if (action === "list") {
      const baseQuery = {};
      if (body.event_id)
        baseQuery.event_id = String(body.event_id);
      const search = String(body.search || "").trim();
      const query = { ...baseQuery };
      if (body.status)
        query.status = String(body.status);
      if (body.payment_status)
        query.payment_status = String(body.payment_status);
      if (body.emission_status)
        query.emission_status = String(body.emission_status);
      if (search) {
        query.$or = [
          { order_number: { $regex: search, $options: "i" } },
          { user_name: { $regex: search, $options: "i" } },
          { user_email: { $regex: search, $options: "i" } },
          { user_phone: { $regex: search, $options: "i" } }
        ];
      }
      const [page, byStatus, byPayment] = await Promise.all([
        base44.asServiceRole.entities.Registration.filter(query, { sort: "-created_date", limit: 200 }),
        base44.asServiceRole.entities.Registration.aggregate({ query: baseQuery, groupBy: "status" }),
        base44.asServiceRole.entities.Registration.aggregate({ query: baseQuery, groupBy: "payment_status" })
      ]);
      return Response.json({
        items: page?.items || [],
        counts: { status: byStatus?.rows || [], payment: byPayment?.rows || [] }
      });
    }
    const orderId = String(body.id || "").trim();
    if (!orderId)
      return Response.json({ error: "Informe o pedido." }, { status: 400 });
    const order = await base44.asServiceRole.entities.Registration.get(orderId).catch(() => null);
    if (!order)
      return Response.json({ error: "Pedido não encontrado." }, { status: 404 });
    if (action === "detail") {
      const [tickets, history] = await Promise.all([loadTickets(base44, order.id), loadHistory(base44, order)]);
      return Response.json({ order, tickets, history });
    }
    if (action === "note") {
      const note = String(body.admin_note || "").slice(0, 1000);
      const updated = await base44.asServiceRole.entities.Registration.update(order.id, { admin_note: note });
      await writeLog(base44, user, "Observação interna atualizada", order, note.slice(0, 200));
      return Response.json({ order: updated });
    }
    if (action === "contacted") {
      if (order.payment_status === "confirmed") {
        return Response.json({ error: "Este pedido já está pago." }, { status: 409 });
      }
      const updated = await base44.asServiceRole.entities.Registration.update(order.id, {
        status: "awaiting_payment"
      });
      await writeLog(base44, user, "Contato com o comprador registrado", order, "Status alterado para aguardando pagamento.");
      return Response.json({ order: updated });
    }
    if (action === "confirm") {
      if (body.confirmed !== true) {
        return Response.json({ error: "A confirmação do pagamento precisa ser confirmada." }, { status: 400 });
      }
      if (order.payment_status === "confirmed" && order.emission_status === "issued") {
        const tickets = await loadTickets(base44, order.id);
        return Response.json({ order, tickets, already: true });
      }
      if (order.status === "cancelled" || order.status === "refunded") {
        return Response.json({ error: "Pedido cancelado ou reembolsado não pode ser pago." }, { status: 409 });
      }
      const stamp = new Date().toISOString();
      const updated = await base44.asServiceRole.entities.Registration.update(order.id, {
        status: "confirmed",
        payment_status: "confirmed",
        confirmed_by: user.email || "",
        confirmed_by_name: user.full_name || "",
        confirmed_at: stamp
      });
      const tickets = await issueTicketsForRegistration(base44, updated);
      await writeLog(base44, user, "Pagamento confirmado e ingressos emitidos", order, `${tickets.length} ingresso(s) emitido(s).`);
      return Response.json({ order: updated, tickets });
    }
    if (action === "delete") {
      const tickets = await loadTickets(base44, order.id);
      if (tickets.length > 0) {
        await base44.asServiceRole.entities.Ticket.deleteMany({ registration_id: order.id });
      }
      if (order.payment_status !== "confirmed") {
        await releaseQuantity(base44, order.ticket_type_id, Math.max(1, Number(order.quantity || 1)));
      }
      await base44.asServiceRole.entities.Registration.delete(order.id);
      await writeLog(base44, user, "Inscrição excluída", order, `${tickets.length} ingresso(s) removido(s).`);
      return Response.json({ deleted: true, tickets_removed: tickets.length });
    }
    if (action === "cancel" || action === "refund") {
      const reason = String(body.reason || "").trim();
      if (reason.length < 3) {
        return Response.json({ error: "Informe o motivo do cancelamento." }, { status: 400 });
      }
      const refund = action === "refund";
      const ticketStatus = refund ? "refunded" : "cancelled";
      const ticketCount = await revokeTicketsForRegistration(base44, order, reason, ticketStatus);
      if (order.payment_status !== "confirmed") {
        await releaseQuantity(base44, order.ticket_type_id, Math.max(1, Number(order.quantity || 1)));
      }
      const updated = await base44.asServiceRole.entities.Registration.update(order.id, {
        status: refund ? "refunded" : "cancelled",
        payment_status: refund ? "refunded" : "cancelled",
        cancelled_by: user.email || "",
        cancelled_at: new Date().toISOString(),
        cancel_reason: reason
      });
      await writeLog(base44, user, refund ? "Pedido reembolsado" : "Pedido cancelado", order, `${reason}${ticketCount ? ` — ${ticketCount} ingresso(s) invalidado(s).` : ""}`);
      return Response.json({ order: updated, tickets_revoked: ticketCount });
    }
    return Response.json({ error: "Ação não reconhecida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
