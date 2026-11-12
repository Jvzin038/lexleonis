import { createClientFromRequest } from "../sdk.js";
import { isStaffMember } from "../shared/staffAuth.js";
import { issueTicketsForRegistration } from "../shared/ticketIssue.js";
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const registrationId = String(body.registration_id || "").trim();
    if (!registrationId) {
      return Response.json({ error: "registration_id é obrigatório" }, { status: 400 });
    }
    const registration = await base44.asServiceRole.entities.Registration.get(registrationId);
    if (!registration) {
      return Response.json({ error: "Inscrição não encontrada" }, { status: 404 });
    }
    const staff = await isStaffMember(base44, user);
    if (registration.user_id !== user.id && !staff) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const paymentSettled = registration.payment_status === "confirmed" || registration.payment_status === "not_required";
    if (registration.status !== "confirmed" || !paymentSettled) {
      return Response.json({
        error: "O ingresso só é emitido após a confirmação do pagamento pela diretoria.",
        ticket_issued: false
      }, { status: 409 });
    }
    const tickets = await issueTicketsForRegistration(base44, registration);
    return Response.json({ tickets, ticket_issued: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
