import { createClientFromRequest } from "../sdk.js";
import { requirePermission } from "../shared/staffAuth.js";
import { eventWindow } from "../shared/ticketRules.js";
import { fetchSettings } from "../shared/ticketIssue.js";
const MESSAGES = {
  ok: "Entrada liberada.",
  duplicate: "Ingresso já utilizado.",
  invalid: "Ingresso não encontrado.",
  cancelled: "Ingresso cancelado pela organização.",
  refunded: "Ingresso reembolsado: entrada não permitida.",
  expired: "Ingresso expirado.",
  wrong_event: "Ingresso de outro evento.",
  not_paid: "Pagamento não confirmado para este ingresso.",
  not_open: "A entrada para este evento ainda não foi aberta."
};
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const access = await requirePermission(base44, user, "checkin");
    if (!access.ok) {
      return Response.json({ error: "Sua conta não tem permissão para validar ingressos." }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const code = String(body.code || "").trim().toUpperCase();
    const eventId = String(body.event_id || "").trim();
    if (!code)
      return Response.json({ error: "Informe o código do ingresso." }, { status: 400 });
    const found = await base44.asServiceRole.entities.Ticket.filter({ code }, { limit: 1 });
    const ticket = found?.items?.[0];
    const writeLog = async (result, note) => {
      await base44.asServiceRole.entities.CheckInLog.create({
        ticket_code: code,
        ticket_id: ticket?.id || "",
        holder_name: ticket?.holder_name || "",
        event_id: ticket?.event_id || eventId || "",
        event_title: ticket?.event_title || "",
        result,
        operator_email: user.email || "",
        operator_name: user.full_name || "",
        note: note || ""
      });
    };
    const refuse = async (result, status, note) => {
      await writeLog(result, note || "");
      return Response.json({ result, message: MESSAGES[result] || MESSAGES.invalid, ticket: ticket || null }, { status });
    };
    if (!ticket)
      return refuse("invalid", 404, "Código não encontrado");
    if (eventId && ticket.event_id !== eventId) {
      return refuse("wrong_event", 409, `Ingresso do evento ${ticket.event_title || ticket.event_id}`);
    }
    if (ticket.status === "cancelled")
      return refuse("cancelled", 409, ticket.revoked_reason || "Ingresso cancelado");
    if (ticket.status === "refunded")
      return refuse("refunded", 409, ticket.revoked_reason || "Ingresso reembolsado");
    if (ticket.status === "expired")
      return refuse("expired", 409, "Validade encerrada");
    if (ticket.status === "used") {
      return refuse("duplicate", 409, `Já utilizado em ${ticket.checked_in_at || "data não registrada"}`);
    }
    const paymentOk = ticket.payment_status === "confirmed" || ticket.payment_status === "not_required";
    if (!paymentOk)
      return refuse("not_paid", 409, `Pagamento ${ticket.payment_status || "pendente"}`);
    const event = ticket.event_id ? await base44.asServiceRole.entities.Event.get(ticket.event_id).catch(() => null) : null;
    const settings = await fetchSettings(base44);
    const window = eventWindow(event, settings);
    const now = Date.now();
    if (window.openAt && now < window.openAt.getTime()) {
      return refuse("not_open", 409, `Entrada liberada a partir de ${window.openAt.toISOString()}`);
    }
    if (window.validUntil && now > window.validUntil.getTime()) {
      await base44.asServiceRole.entities.Ticket.updateMany({ id: ticket.id, status: "valid" }, { $set: { status: "expired" } });
      return refuse("expired", 409, "O evento já foi encerrado");
    }
    const stamp = new Date().toISOString();
    await base44.asServiceRole.entities.Ticket.updateMany({ id: ticket.id, status: "valid" }, {
      $set: {
        status: "used",
        checked_in_at: stamp,
        checked_in_by: user.email || "",
        checked_in_by_name: user.full_name || ""
      }
    });
    const after = await base44.asServiceRole.entities.Ticket.get(ticket.id).catch(() => null);
    if (!after || after.checked_in_at !== stamp) {
      return refuse("duplicate", 409, "Validação simultânea detectada");
    }
    await writeLog("ok", "");
    return Response.json({ result: "ok", message: MESSAGES.ok, ticket: after });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
