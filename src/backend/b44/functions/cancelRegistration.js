import { createClientFromRequest } from "../sdk.js";
import { releaseQuantity } from "../shared/ticketIssue.js";
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Entre na sua conta para cancelar a inscrição." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const registrationId = String(body.registration_id || "").trim();
    if (!registrationId)
      return Response.json({ error: "Informe a inscrição." }, { status: 400 });
    const registration = await base44.asServiceRole.entities.Registration.get(registrationId).catch(() => null);
    if (!registration)
      return Response.json({ error: "Inscrição não encontrada." }, { status: 404 });
    if (registration.user_id !== user.id) {
      return Response.json({ error: "Esta inscrição pertence a outra conta." }, { status: 403 });
    }
    if (registration.status === "cancelled" || registration.status === "refunded") {
      return Response.json({ registration, already: true });
    }
    if (registration.payment_status === "confirmed" || registration.emission_status === "issued") {
      return Response.json({
        error: "Esta inscrição já tem pagamento confirmado ou ingresso emitido. Fale com a diretoria para solicitar o cancelamento ou reembolso."
      }, { status: 409 });
    }
    if (registration.status === "pending" || registration.status === "awaiting_payment") {
      await releaseQuantity(base44, registration.ticket_type_id, Math.max(1, Number(registration.quantity || 1)));
    }
    const updated = await base44.asServiceRole.entities.Registration.update(registration.id, {
      status: "cancelled",
      payment_status: "cancelled",
      cancelled_by: user.email || "",
      cancelled_at: new Date().toISOString(),
      cancel_reason: "Cancelada pelo próprio participante na área do aluno"
    });
    await base44.asServiceRole.entities.AdminLog.create({
      action: "Inscrição cancelada pelo participante",
      module: "Inscrições",
      record_label: registration.order_number || registration.code || registration.id,
      user_email: user.email || "",
      user_name: user.full_name || "",
      details: `${registration.event_title || ""} — ${registration.quantity}x ${registration.ticket_type_name || ""}`
    });
    return Response.json({ registration: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
