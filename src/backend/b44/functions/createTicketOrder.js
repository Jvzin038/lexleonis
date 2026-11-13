import { createClientFromRequest } from "../sdk.js";
import {
  eventWindow,
  formatDateBR,
  makeOrderNumber,
  todayInSaoPaulo
} from "../shared/ticketRules.js";
import { issueTicketsForRegistration, reserveQuantity, releaseQuantity } from "../shared/ticketIssue.js";
import { uniqueTicketCode } from "../shared/staffAuth.js";
import { createAsaasPixPayment, createAsaasCardPayment } from "../shared/asaasPix.js";
import { evaluateEventBatches } from "../shared/batchRotation.js";
function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Entre na sua conta para comprar ingressos." }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const eventId = String(body.event_id || "").trim();
    const ticketTypeId = String(body.ticket_type_id || "").trim();
    const quantity = Math.max(1, Math.floor(Number(body.quantity || 1)));
    const buyerName = String(body.buyer_name || "").trim().slice(0, 200);
    const buyerEmail = String(body.buyer_email || "").trim().slice(0, 200);
    const buyerPhone = String(body.buyer_phone || "").trim().slice(0, 40);
    const buyerCpf = String(body.buyer_cpf || "").trim().slice(0, 20);
    const participants = Array.isArray(body.participants) ? body.participants : [];
    const waitlist = body.waitlist === true;
    const paymentMethod = body.payment_method === "card" ? "card" : "pix";
    if (!eventId) {
      return Response.json({ error: "Selecione o evento." }, { status: 400 });
    }
    const settingsPage = await base44.asServiceRole.entities.SiteSettings.list({
      sort: "-updated_date",
      limit: 1
    });
    const settings = settingsPage?.items?.[0] || {};
    const event = await base44.asServiceRole.entities.Event.get(eventId).catch(() => null);
    if (!event)
      return Response.json({ error: "Evento não encontrado." }, { status: 404 });
    if (event.status !== "published") {
      return Response.json({ error: "Este evento não está aberto para compras." }, { status: 409 });
    }
    await evaluateEventBatches(base44, eventId);
    if (waitlist) {
      if (event.registration_mode !== "waitlist") {
        return Response.json({ error: "Este evento não está com lista de espera aberta." }, { status: 409 });
      }
      const waitingNumber = makeOrderNumber("LES");
      const waiting = await base44.asServiceRole.entities.Registration.create({
        order_number: waitingNumber,
        event_id: event.id,
        event_title: event.title,
        ticket_type_id: "",
        ticket_type_name: "Lista de espera",
        user_id: user.id,
        user_email: buyerEmail || user.email || "",
        user_name: buyerName || user.full_name || "",
        user_phone: buyerPhone,
        quantity: 1,
        unit_price: 0,
        total_amount: 0,
        status: "waitlist",
        payment_status: "not_required",
        payment_method: "none",
        emission_status: "not_issued",
        code: uniqueTicketCode()
      });
      await base44.asServiceRole.entities.AdminLog.create({
        action: "Entrada na lista de espera registrada pelo site",
        module: "Inscrições",
        record_label: waitingNumber,
        user_email: user.email || "",
        user_name: user.full_name || "",
        details: event.title
      });
      return Response.json({ order: waiting, order_number: waitingNumber, tickets: [], free: false, waitlist: true }, { status: 201 });
    }
    if (!ticketTypeId) {
      return Response.json({ error: "Selecione o tipo de ingresso." }, { status: 400 });
    }
    if (!buyerName || buyerName.length < 3) {
      return Response.json({ error: "Informe o nome do responsável pela compra." }, { status: 400 });
    }
    if (!buyerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
      return Response.json({ error: "Informe um e-mail válido para o responsável pela compra." }, { status: 400 });
    }
    if (settings.require_phone_on_order !== false && onlyDigits(buyerPhone).length < 10) {
      return Response.json({ error: "Informe um telefone com DDD para o responsável pela compra." }, { status: 400 });
    }
    const ticketType = await base44.asServiceRole.entities.TicketType.get(ticketTypeId).catch(() => null);
    if (!ticketType || ticketType.event_id !== eventId || ticketType.active === false) {
      return Response.json({ error: "Tipo de ingresso indisponível para este evento." }, { status: 409 });
    }
    const today = todayInSaoPaulo();
    const salesStart = ticketType.sales_start ? String(ticketType.sales_start).slice(0, 10) : "";
    const salesEnd = ticketType.sales_end ? String(ticketType.sales_end).slice(0, 10) : "";
    if (salesStart && today < salesStart) {
      return Response.json({ error: `As vendas deste lote começam em ${formatDateBR(salesStart)}.` }, { status: 409 });
    }
    if (salesEnd && today > salesEnd) {
      return Response.json({ error: "As vendas deste lote foram encerradas." }, { status: 409 });
    }
    const maxPerBuyer = Math.max(1, Number(ticketType.max_per_buyer || 10));
    if (quantity > maxPerBuyer) {
      return Response.json({ error: `O limite é de ${maxPerBuyer} ingresso(s) por pessoa neste lote.` }, { status: 409 });
    }
    if (participants.length !== quantity) {
      return Response.json({ error: `Informe os dados de cada participante (${quantity} ingresso(s)).` }, { status: 400 });
    }
    const requireCpf = event.require_participant_cpf === true;
    const requireEmail = event.require_participant_email === true;
    const requirePhone = event.require_participant_phone === true;
    for (let i = 0;i < participants.length; i += 1) {
      const p = participants[i] || {};
      const pName = String(p.name || "").trim();
      if (pName.length < 3) {
        return Response.json({ error: `Informe o nome do participante ${i + 1}.` }, { status: 400 });
      }
      if (requireCpf && onlyDigits(p.cpf).length < 11) {
        return Response.json({ error: `Informe o CPF do participante ${i + 1}.` }, { status: 400 });
      }
      if (requireEmail && (!p.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(p.email)))) {
        return Response.json({ error: `Informe um e-mail válido do participante ${i + 1}.` }, { status: 400 });
      }
      if (requirePhone && onlyDigits(p.phone).length < 10) {
        return Response.json({ error: `Informe o telefone do participante ${i + 1}.` }, { status: 400 });
      }
    }
    const total = Number(ticketType.quantity_total || 0);
    const sold = Number(ticketType.quantity_sold || 0);
    if (total > 0 && sold + quantity > total) {
      const remaining = Math.max(0, total - sold);
      return Response.json({
        error: remaining > 0 ? `Restam apenas ${remaining} ingresso(s) neste lote.` : "Este lote está esgotado.",
        available: remaining
      }, { status: 409 });
    }
    const price = Number(ticketType.price || 0);
    const isFree = Boolean(ticketType.is_free) || price === 0;
    if (!isFree && onlyDigits(buyerCpf).length < 11) {
      return Response.json({ error: "Informe o CPF/CNPJ do comprador para gerar a cobrança Pix." }, { status: 400 });
    }
    const reservation = await reserveQuantity(base44, ticketType, quantity);
    if (!reservation.ok) {
      return Response.json({ error: reservation.error }, { status: 409 });
    }
    const orderNumber = makeOrderNumber("ING");
    const registration = await base44.asServiceRole.entities.Registration.create({
      order_number: orderNumber,
      event_id: event.id,
      event_title: event.title,
      ticket_type_id: ticketType.id,
      ticket_type_name: ticketType.name,
      user_id: user.id,
      user_email: buyerEmail || user.email || "",
      user_name: buyerName || user.full_name || "",
      user_phone: buyerPhone,
      buyer_cpf: buyerCpf,
      participants: participants.map((p) => ({
        name: String(p.name || "").slice(0, 200),
        cpf: String(p.cpf || "").slice(0, 20),
        email: String(p.email || "").slice(0, 200),
        phone: String(p.phone || "").slice(0, 40)
      })),
      quantity,
      unit_price: price,
      total_amount: price * quantity,
      status: isFree ? "confirmed" : "awaiting_payment",
      payment_status: isFree ? "not_required" : "pending",
      payment_method: isFree ? "none" : paymentMethod,
      payment_provider: isFree ? "none" : "asaas",
      emission_status: "not_issued",
      code: uniqueTicketCode()
    });
    let tickets = [];
    if (isFree)
      tickets = await issueTicketsForRegistration(base44, registration, { settings, event });
    await base44.asServiceRole.entities.AdminLog.create({
      action: isFree ? "Inscrição gratuita registrada pelo site" : "Pedido de ingresso registrado pelo site",
      module: "Ingressos",
      record_label: orderNumber,
      user_email: user.email || "",
      user_name: user.full_name || "",
      details: `${quantity}x ${ticketType.name} — ${event.title}`
    });
    const window = eventWindow(event, settings);
    if (isFree) {
      return Response.json({
        order: registration,
        order_number: orderNumber,
        tickets,
        free: true,
        open_at: window.openAt ? window.openAt.toISOString() : "",
        valid_until: window.validUntil ? window.validUntil.toISOString() : ""
      }, { status: 201 });
    }
    try {
      const amount = price * quantity;
      if (paymentMethod === "card") {
        const card = await createAsaasCardPayment({
          amount,
          registrationId: registration.id,
          description: `Ingressos — ${event.title} (${orderNumber})`,
          buyerName,
          buyerEmail,
          buyerCpf,
          buyerPhone,
          successUrl: `${new URL(req.url).origin}/meus-ingressos`
        });
        const cardReservationExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        await base44.asServiceRole.entities.Registration.update(registration.id, {
          asaas_payment_id: card.id,
          reservation_expires_at: cardReservationExpiresAt
        });
        return Response.json({
          order: registration,
          order_number: orderNumber,
          tickets: [],
          free: false,
          card: true,
          invoice_url: card.invoice_url,
          payment_intent_id: card.id,
          reservation_expires_at: cardReservationExpiresAt,
          open_at: window.openAt ? window.openAt.toISOString() : "",
          valid_until: window.validUntil ? window.validUntil.toISOString() : ""
        }, { status: 201 });
      }
      const pix = await createAsaasPixPayment({
        amount,
        registrationId: registration.id,
        description: `Ingressos — ${event.title} (${orderNumber})`,
        buyerName,
        buyerEmail,
        buyerCpf,
        buyerPhone
      });
      const reservationExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await base44.asServiceRole.entities.Registration.update(registration.id, {
        asaas_payment_id: pix.id,
        pix_qr_code: pix.pix_qr_code,
        pix_copy_paste: pix.pix_copy_paste,
        pix_expires_at: pix.pix_expires_at,
        reservation_expires_at: reservationExpiresAt
      });
      return Response.json({
        order: registration,
        order_number: orderNumber,
        tickets: [],
        free: false,
        pix: true,
        pix_qr_code: pix.pix_qr_code,
        pix_copy_paste: pix.pix_copy_paste,
        pix_expires_at: pix.pix_expires_at,
        payment_intent_id: pix.id,
        reservation_expires_at: reservationExpiresAt,
        open_at: window.openAt ? window.openAt.toISOString() : "",
        valid_until: window.validUntil ? window.validUntil.toISOString() : ""
      }, { status: 201 });
    } catch (pixError) {
      await releaseQuantity(base44, ticketType.id, quantity);
      await base44.asServiceRole.entities.Registration.update(registration.id, {
        status: "cancelled",
        payment_status: "cancelled"
      });
      return Response.json({ error: `Não foi possível gerar a cobrança: ${pixError.message}` }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
