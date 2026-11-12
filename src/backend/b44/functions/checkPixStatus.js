import { createClientFromRequest } from "../sdk.js";
import {
  createAsaasPixPayment,
  retrieveAsaasPayment,
  cancelAsaasPayment,
  processAsaasPaymentSuccess,
  processAsaasStoreOrderSuccess,
  cancelAsaasStoreOrder,
  releaseReservation
} from "../shared/asaasPix.js";
import { releaseQuantity } from "../shared/ticketIssue.js";
import { todayInSaoPaulo } from "../shared/ticketRules.js";
const RESERVATION_MINUTES = 30;
async function releaseOrderStock(base44, order) {
  if (order.stock_released === true)
    return;
  const itemsPage = await base44.asServiceRole.entities.OrderItem.filter({ order_id: order.id }, { limit: 100 });
  for (const item of itemsPage?.items || []) {
    if (item.track_stock === false)
      continue;
    await base44.asServiceRole.entities.Product.updateMany({ id: item.product_id }, { $inc: { stock: Number(item.quantity || 0) } });
  }
  await base44.asServiceRole.entities.Order.update(order.id, { stock_released: true });
}
async function handleStoreOrder(base44, user, body, action, orderId) {
  const order = await base44.asServiceRole.entities.Order.get(orderId).catch(() => null);
  if (!order)
    return Response.json({ error: "Pedido não encontrado." }, { status: 404 });
  if (order.user_id !== user.id)
    return Response.json({ error: "Forbidden" }, { status: 403 });
  if (action === "regenerate") {
    if (order.payment_status === "confirmed") {
      return Response.json({ error: "Este pedido já está pago." }, { status: 409 });
    }
    const reservationExpired = order.reservation_expires_at && new Date(order.reservation_expires_at) < new Date;
    if (reservationExpired) {
      await releaseOrderStock(base44, order);
      await base44.asServiceRole.entities.Order.update(order.id, {
        status: "cancelled",
        payment_status: "cancelled"
      });
      return Response.json({ error: "O prazo do pedido expirou. Inicie uma nova compra." }, { status: 409 });
    }
    const amount = Number(order.total_amount);
    const buyerCpf = order.buyer_cpf || "";
    const buyerPhone = order.contact_phone || "";
    if (order.asaas_payment_id) {
      await cancelAsaasPayment(order.asaas_payment_id);
    }
    const pix = await createAsaasPixPayment({
      amount,
      registrationId: order.id,
      description: `Loja Lex Leonis — Pedido ${order.order_number}`,
      buyerName: order.user_name || "Comprador",
      buyerEmail: order.user_email || "",
      buyerCpf,
      buyerPhone
    });
    const reservationExpiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000).toISOString();
    const updated = await base44.asServiceRole.entities.Order.update(order.id, {
      asaas_payment_id: pix.id,
      pix_qr_code: pix.pix_qr_code,
      pix_copy_paste: pix.pix_copy_paste,
      pix_expires_at: pix.pix_expires_at,
      payment_status: "pending",
      status: "awaiting_payment",
      reservation_expires_at: reservationExpiresAt
    });
    return Response.json({
      status: "pending",
      order: updated,
      pix_qr_code: pix.pix_qr_code,
      pix_copy_paste: pix.pix_copy_paste,
      pix_expires_at: pix.pix_expires_at,
      payment_intent_id: pix.id
    });
  }
  if (order.payment_status === "confirmed") {
    return Response.json({ status: "confirmed", order });
  }
  if (!order.asaas_payment_id) {
    return Response.json({
      status: "pending",
      message: "Aguardando geração da cobrança Pix.",
      pix_qr_code: order.pix_qr_code || "",
      pix_copy_paste: order.pix_copy_paste || "",
      pix_expires_at: order.pix_expires_at || ""
    });
  }
  let payment;
  try {
    payment = await retrieveAsaasPayment(order.asaas_payment_id);
  } catch (asaasError) {
    return Response.json({
      status: "pending",
      message: "Não foi possível consultar o pagamento agora. Tente novamente.",
      pix_qr_code: order.pix_qr_code || "",
      pix_copy_paste: order.pix_copy_paste || "",
      pix_expires_at: order.pix_expires_at || ""
    });
  }
  if (payment.status === "RECEIVED" || payment.status === "CONFIRMED") {
    const result = await processAsaasStoreOrderSuccess(base44, payment.id);
    return Response.json({
      status: "confirmed",
      order: result.order || order
    });
  }
  if (payment.status === "DELETED" || payment.status === "REFUNDED" || payment.status === "OVERDUE") {
    await releaseOrderStock(base44, order);
    await base44.asServiceRole.entities.Order.update(order.id, {
      status: "cancelled",
      payment_status: "cancelled"
    });
    return Response.json({
      status: "expired",
      message: "A cobrança Pix expirou ou foi cancelada. Inicie uma nova compra."
    });
  }
  const reservationExpired = order.reservation_expires_at && new Date(order.reservation_expires_at) < new Date;
  if (reservationExpired) {
    await releaseOrderStock(base44, order);
    await base44.asServiceRole.entities.Order.update(order.id, {
      status: "cancelled",
      payment_status: "cancelled"
    });
    return Response.json({
      status: "expired",
      message: "O prazo do pedido expirou. Inicie uma nova compra."
    });
  }
  return Response.json({
    status: "pending",
    pix_qr_code: order.pix_qr_code || "",
    pix_copy_paste: order.pix_copy_paste || "",
    pix_expires_at: order.pix_expires_at || ""
  });
}
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Entre na sua conta." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "check");
    const registrationId = String(body.registration_id || "").trim();
    const orderId = String(body.order_id || "").trim();
    if (!registrationId && !orderId) {
      return Response.json({ error: "Informe o pedido." }, { status: 400 });
    }
    if (orderId) {
      return handleStoreOrder(base44, user, body, action, orderId);
    }
    const registration = await base44.asServiceRole.entities.Registration.get(registrationId).catch(() => null);
    if (!registration)
      return Response.json({ error: "Pedido não encontrado." }, { status: 404 });
    if (registration.user_id !== user.id)
      return Response.json({ error: "Forbidden" }, { status: 403 });
    if (action === "regenerate") {
      if (registration.payment_status === "confirmed") {
        return Response.json({ error: "Este pedido já está pago." }, { status: 409 });
      }
      const reservationExpired = registration.reservation_expires_at && new Date(registration.reservation_expires_at) < new Date;
      if (reservationExpired) {
        return Response.json({ error: "A reserva do seu ingresso expirou. Inicie uma nova compra." }, { status: 409 });
      }
      const ticketType = await base44.asServiceRole.entities.TicketType.get(registration.ticket_type_id).catch(() => null);
      if (!ticketType || !ticketType.active) {
        return Response.json({ error: "O lote selecionado não está mais disponível." }, { status: 409 });
      }
      const today = todayInSaoPaulo();
      if (ticketType.sales_start && String(ticketType.sales_start).slice(0, 10) > today) {
        return Response.json({ error: "As vendas deste lote ainda não abriram." }, { status: 409 });
      }
      if (ticketType.sales_end && String(ticketType.sales_end).slice(0, 10) < today) {
        return Response.json({ error: "As vendas deste lote foram encerradas." }, { status: 409 });
      }
      const amount = Number(registration.total_amount);
      const buyerName = registration.participants?.[0]?.name || registration.user_name || "Comprador";
      const buyerEmail = registration.participants?.[0]?.email || registration.user_email || "";
      const buyerCpf = registration.buyer_cpf || registration.participants?.[0]?.cpf || "";
      const buyerPhone = registration.user_phone || registration.participants?.[0]?.phone || "";
      if (registration.asaas_payment_id) {
        await cancelAsaasPayment(registration.asaas_payment_id);
      }
      const pix = await createAsaasPixPayment({
        amount,
        registrationId: registration.id,
        description: `Ingressos — ${registration.event_title} (${registration.order_number})`,
        buyerName,
        buyerEmail,
        buyerCpf,
        buyerPhone
      });
      const updated = await base44.asServiceRole.entities.Registration.update(registration.id, {
        asaas_payment_id: pix.id,
        pix_qr_code: pix.pix_qr_code,
        pix_copy_paste: pix.pix_copy_paste,
        pix_expires_at: pix.pix_expires_at,
        payment_status: "pending",
        status: "awaiting_payment"
      });
      return Response.json({
        status: "pending",
        registration: updated,
        pix_qr_code: pix.pix_qr_code,
        pix_copy_paste: pix.pix_copy_paste,
        pix_expires_at: pix.pix_expires_at,
        payment_intent_id: pix.id
      });
    }
    if (registration.payment_status === "confirmed") {
      const ticketsPage = await base44.asServiceRole.entities.Ticket.filter({ registration_id: registration.id }, { limit: 100 });
      return Response.json({ status: "confirmed", tickets: ticketsPage?.items || [] });
    }
    if (!registration.asaas_payment_id) {
      return Response.json({
        status: "pending",
        message: "Aguardando geração da cobrança Pix.",
        pix_qr_code: registration.pix_qr_code || "",
        pix_copy_paste: registration.pix_copy_paste || "",
        pix_expires_at: registration.pix_expires_at || ""
      });
    }
    let payment;
    try {
      payment = await retrieveAsaasPayment(registration.asaas_payment_id);
    } catch (asaasError) {
      return Response.json({
        status: "pending",
        message: "Não foi possível consultar o pagamento agora. Tente novamente.",
        pix_qr_code: registration.pix_qr_code || "",
        pix_copy_paste: registration.pix_copy_paste || "",
        pix_expires_at: registration.pix_expires_at || ""
      });
    }
    if (payment.status === "RECEIVED" || payment.status === "CONFIRMED") {
      const result = await processAsaasPaymentSuccess(base44, payment.id);
      return Response.json({
        status: "confirmed",
        tickets: result.tickets || []
      });
    }
    if (payment.status === "DELETED" || payment.status === "REFUNDED" || payment.status === "OVERDUE") {
      if (registration.ticket_type_id && registration.quantity) {
        await releaseQuantity(base44, registration.ticket_type_id, Math.max(1, Number(registration.quantity || 1)));
      }
      await base44.asServiceRole.entities.Registration.update(registration.id, {
        status: "cancelled",
        payment_status: "cancelled"
      });
      return Response.json({
        status: "expired",
        message: "A cobrança Pix expirou ou foi cancelada. Inicie uma nova compra."
      });
    }
    const reservationExpired = registration.reservation_expires_at && new Date(registration.reservation_expires_at) < new Date;
    if (reservationExpired) {
      if (registration.ticket_type_id && registration.quantity) {
        await releaseQuantity(base44, registration.ticket_type_id, Math.max(1, Number(registration.quantity || 1)));
      }
      await base44.asServiceRole.entities.Registration.update(registration.id, {
        status: "cancelled",
        payment_status: "cancelled"
      });
      return Response.json({
        status: "expired",
        message: "O prazo de reserva dos ingressos expirou. Inicie uma nova compra."
      });
    }
    return Response.json({
      status: "pending",
      pix_qr_code: registration.pix_qr_code || "",
      pix_copy_paste: registration.pix_copy_paste || "",
      pix_expires_at: registration.pix_expires_at || ""
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
