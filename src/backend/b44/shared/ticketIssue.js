import { eventWindow, toIso } from "./ticketRules.js";
import { uniqueTicketCode } from "./staffAuth.js";
export async function fetchSettings(base44) {
  try {
    const page = await base44.asServiceRole.entities.SiteSettings.list({ sort: "-updated_date", limit: 1 });
    return page?.items?.[0] || {};
  } catch (error) {
    return {};
  }
}
export async function reserveQuantity(base44, ticketType, quantity) {
  const total = Number(ticketType?.quantity_total || 0);
  await base44.asServiceRole.entities.TicketType.updateMany({ id: ticketType.id }, { $inc: { quantity_sold: quantity } });
  const after = await base44.asServiceRole.entities.TicketType.get(ticketType.id).catch(() => null);
  const sold = Number(after?.quantity_sold || 0);
  if (total > 0 && sold > total) {
    await base44.asServiceRole.entities.TicketType.updateMany({ id: ticketType.id }, { $inc: { quantity_sold: -quantity } });
    return { ok: false, error: "Este lote acabou de esgotar. Escolha outro tipo de ingresso." };
  }
  return { ok: true, sold };
}
export async function releaseQuantity(base44, ticketTypeId, quantity) {
  if (!ticketTypeId || quantity <= 0)
    return;
  const ticketType = await base44.asServiceRole.entities.TicketType.get(ticketTypeId).catch(() => null);
  if (!ticketType)
    return;
  const sold = Math.max(0, Number(ticketType.quantity_sold || 0) - quantity);
  await base44.asServiceRole.entities.TicketType.updateMany({ id: ticketTypeId }, { $set: { quantity_sold: sold } });
}
export async function issueTicketsForRegistration(base44, registration, options = {}) {
  const existing = await base44.asServiceRole.entities.Ticket.filter({ registration_id: registration.id }, { limit: 100 });
  if (existing?.items?.length) {
    if (registration.emission_status !== "issued" || registration.ticket_issued !== true) {
      await base44.asServiceRole.entities.Registration.update(registration.id, {
        emission_status: "issued",
        ticket_issued: true
      });
    }
    return existing.items;
  }
  const settings = options.settings || await fetchSettings(base44);
  let event = options.event || null;
  if (!event && registration.event_id) {
    event = await base44.asServiceRole.entities.Event.get(registration.event_id).catch(() => null);
  }
  const window = eventWindow(event, settings);
  const paymentStatus = registration.payment_status === "not_required" ? "not_required" : "confirmed";
  const quantity = Math.max(1, Math.floor(Number(registration.quantity || 1)));
  const participants = Array.isArray(registration.participants) ? registration.participants : [];
  const records = Array.from({ length: quantity }, (_, i) => {
    const participant = participants[i] || {};
    return {
      registration_id: registration.id,
      order_number: registration.order_number || "",
      event_id: registration.event_id,
      event_title: registration.event_title || event?.title || "",
      event_date: event?.start_date || "",
      event_start_time: event?.start_time || "",
      event_location: [event?.location_name, event?.address].filter(Boolean).join(" — "),
      event_end_at: toIso(window.endsAt),
      valid_until: toIso(window.validUntil),
      user_id: registration.user_id,
      holder_name: participant.name || registration.user_name || "",
      participant_name: participant.name || "",
      participant_cpf: participant.cpf || "",
      participant_email: participant.email || "",
      participant_phone: participant.phone || "",
      ticket_type_name: registration.ticket_type_name || "",
      payment_status: paymentStatus,
      code: uniqueTicketCode(),
      status: "valid",
      issued_at: new Date().toISOString()
    };
  });
  const created = await base44.asServiceRole.entities.Ticket.bulkCreate(records);
  await base44.asServiceRole.entities.Registration.update(registration.id, {
    emission_status: "issued",
    ticket_issued: true
  });
  return created;
}
export async function revokeTicketsForRegistration(base44, registration, reason, status = "cancelled") {
  const page = await base44.asServiceRole.entities.Ticket.filter({ registration_id: registration.id, status: "valid" }, { limit: 200 });
  const tickets = page?.items || [];
  if (tickets.length === 0) {
    await base44.asServiceRole.entities.Registration.update(registration.id, { emission_status: "revoked" });
    return 0;
  }
  await base44.asServiceRole.entities.Ticket.bulkUpdate(tickets.map((ticket) => ({ id: ticket.id, status, revoked_reason: reason || "" })));
  await base44.asServiceRole.entities.Registration.update(registration.id, { emission_status: "revoked" });
  return tickets.length;
}
