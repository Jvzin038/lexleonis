import { secrets } from "../sdk.js";
import { issueTicketsForRegistration, releaseQuantity } from "./ticketIssue.js";
const ASAAS_API = "https://api.asaas.com";
function asaasKey() {
  return secrets.get("ASAAS_API_KEY");
}
function asaasWalletId() {
  return secrets.get("ASAAS_WALLET_ID");
}
async function asaasRequest(path, options = {}) {
  const key = asaasKey();
  if (!key)
    throw new Error("ASAAS_API_KEY não configurada.");
  const res = await fetch(`${ASAAS_API}${path}`, {
    ...options,
    headers: {
      access_token: key,
      "Content-Type": "application/json",
      "User-Agent": "LexLeonis/1.0",
      ...options.headers || {}
    },
    signal: AbortSignal.timeout(options.timeout || 15000)
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data.errors?.[0]?.description || data.error?.message || "Erro na API Asaas.";
    throw new Error(msg);
  }
  return data;
}
async function findOrCreateCustomer(params) {
  const cpfCnpj = String(params.cpfCnpj || "").replace(/\D/g, "");
  if (cpfCnpj) {
    const list = await asaasRequest(`/v3/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}`);
    if (list.data && list.data.length > 0) {
      return list.data[0];
    }
  }
  return asaasRequest("/v3/customers", {
    method: "POST",
    body: JSON.stringify({
      name: String(params.name || "Comprador").slice(0, 200),
      cpfCnpj,
      email: String(params.email || "").slice(0, 200),
      mobilePhone: String(params.phone || "").slice(0, 20),
      externalReference: String(params.externalReference || "")
    })
  });
}
export async function createAsaasPixPayment(params) {
  const customer = await findOrCreateCustomer({
    name: params.buyerName,
    cpfCnpj: params.buyerCpf,
    email: params.buyerEmail,
    phone: params.buyerPhone,
    externalReference: params.registrationId
  });
  const value = Number(params.amount);
  if (!value || value <= 0)
    throw new Error("Valor da cobrança inválido.");
  const due = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const dueDateStr = due.toISOString().slice(0, 10);
  const payment = await asaasRequest("/v3/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: customer.id,
      billingType: "PIX",
      value: Number(value.toFixed(2)),
      dueDate: dueDateStr,
      description: String(params.description || "").slice(0, 500),
      externalReference: String(params.registrationId || "")
    })
  });
  const qrCode = await asaasRequest(`/v3/payments/${payment.id}/pixQrCode`);
  return {
    id: payment.id,
    pix_qr_code: qrCode.encodedImage || "",
    pix_copy_paste: qrCode.payload || "",
    pix_expires_at: qrCode.expirationDate ? new Date(qrCode.expirationDate).toISOString() : ""
  };
}
export async function retrieveAsaasPayment(paymentId) {
  return asaasRequest(`/v3/payments/${paymentId}`);
}
export async function cancelAsaasPayment(paymentId) {
  if (!paymentId)
    return;
  try {
    await asaasRequest(`/v3/payments/${paymentId}`, { method: "DELETE" });
  } catch (error) {}
}
export async function processAsaasPaymentSuccess(base44, paymentId) {
  const page = await base44.asServiceRole.entities.Registration.filter({ asaas_payment_id: paymentId }, { limit: 1 });
  const registration = page?.items?.[0];
  if (!registration) {
    return { ok: false, error: "Pedido não encontrado para esta cobrança." };
  }
  if (registration.payment_status === "confirmed") {
    const ticketsPage = await base44.asServiceRole.entities.Ticket.filter({ registration_id: registration.id }, { limit: 100 });
    return { ok: true, registration, tickets: ticketsPage?.items || [], already: true };
  }
  const stamp = new Date().toISOString();
  const updated = await base44.asServiceRole.entities.Registration.update(registration.id, {
    status: "confirmed",
    payment_status: "confirmed",
    payment_method: "pix",
    payment_provider: "asaas",
    confirmed_at: stamp
  });
  const tickets = await issueTicketsForRegistration(base44, updated);
  await base44.asServiceRole.entities.AdminLog.create({
    action: "Pagamento Pix confirmado (Asaas)",
    module: "Ingressos",
    record_label: registration.order_number || registration.id,
    details: `${tickets.length} ingresso(s) emitido(s). Cobrança Asaas: ${paymentId}`
  });
  return { ok: true, registration: updated, tickets };
}
export async function cancelAsaasRegistration(base44, paymentId) {
  const page = await base44.asServiceRole.entities.Registration.filter({ asaas_payment_id: paymentId }, { limit: 1 });
  const registration = page?.items?.[0];
  if (!registration)
    return;
  if (registration.payment_status === "confirmed")
    return;
  await base44.asServiceRole.entities.Registration.update(registration.id, {
    status: "cancelled",
    payment_status: "cancelled"
  });
  if (registration.ticket_type_id && registration.quantity) {
    await releaseQuantity(base44, registration.ticket_type_id, Math.max(1, Number(registration.quantity || 1)));
  }
}
export async function processAsaasStoreOrderSuccess(base44, paymentId) {
  const page = await base44.asServiceRole.entities.Order.filter({ asaas_payment_id: paymentId }, { limit: 1 });
  const order = page?.items?.[0];
  if (!order) {
    return { ok: false, error: "Pedido não encontrado para esta cobrança." };
  }
  if (order.payment_status === "confirmed") {
    return { ok: true, order, already: true };
  }
  const stamp = new Date().toISOString();
  const updated = await base44.asServiceRole.entities.Order.update(order.id, {
    status: "paid",
    payment_status: "confirmed",
    payment_method: "pix",
    payment_provider: "asaas",
    confirmed_at: stamp
  });
  await base44.asServiceRole.entities.AdminLog.create({
    action: "Pagamento Pix confirmado (Asaas) — Loja",
    module: "Pedidos da loja",
    record_label: order.order_number || order.id,
    details: `Cobrança Asaas: ${paymentId}`
  });
  return { ok: true, order: updated };
}
export async function cancelAsaasStoreOrder(base44, paymentId) {
  const page = await base44.asServiceRole.entities.Order.filter({ asaas_payment_id: paymentId }, { limit: 1 });
  const order = page?.items?.[0];
  if (!order)
    return;
  if (order.payment_status === "confirmed")
    return;
  await base44.asServiceRole.entities.Order.update(order.id, {
    status: "cancelled",
    payment_status: "cancelled"
  });
  if (order.stock_released !== true) {
    const itemsPage = await base44.asServiceRole.entities.OrderItem.filter({ order_id: order.id }, { limit: 100 });
    for (const item of itemsPage?.items || []) {
      if (item.track_stock === false)
        continue;
      await base44.asServiceRole.entities.Product.updateMany({ id: item.product_id }, { $inc: { stock: Number(item.quantity || 0) } });
    }
    await base44.asServiceRole.entities.Order.update(order.id, { stock_released: true });
  }
}
export async function releaseReservation(base44, registration) {
  if (!registration || !registration.ticket_type_id || !registration.quantity)
    return;
  if (registration.payment_status === "confirmed")
    return;
  await releaseQuantity(base44, registration.ticket_type_id, Math.max(1, Number(registration.quantity || 1)));
}
export function verifyAsaasWebhookOrigin(req, payload) {
  const webhookToken = secrets.get("ASAAS_WEBHOOK_TOKEN");
  if (webhookToken) {
    const headerToken = req.headers.get("asaas-access-token");
    if (headerToken && headerToken === webhookToken)
      return true;
  }
  const walletId = asaasWalletId();
  if (walletId) {
    const accountWalletId = payload?.account?.id;
    if (accountWalletId && accountWalletId === walletId)
      return true;
  }
  return false;
}
