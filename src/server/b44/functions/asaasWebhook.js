import { createClientFromRequest } from "../sdk.js";
import {
  verifyAsaasWebhookOrigin,
  processAsaasPaymentSuccess,
  cancelAsaasRegistration,
  processAsaasStoreOrderSuccess,
  cancelAsaasStoreOrder
} from "../shared/asaasPix.js";
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const rawBody = await req.text();
    if (!rawBody) {
      return Response.json({ error: "Corpo vazio." }, { status: 400 });
    }
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return Response.json({ error: "JSON inválido." }, { status: 400 });
    }
    if (!verifyAsaasWebhookOrigin(req, event)) {
      return Response.json({ error: "Origem não autorizada." }, { status: 401 });
    }
    const eventType = event.event;
    const paymentId = event.payment?.id;
    if (!paymentId) {
      return Response.json({ received: true, skipped: "no_payment_id" });
    }
    if (eventType === "PAYMENT_CONFIRMED" || eventType === "PAYMENT_RECEIVED") {
      const result = await processAsaasPaymentSuccess(base44, paymentId);
      if (!result.ok) {
        const storeResult = await processAsaasStoreOrderSuccess(base44, paymentId);
        if (!storeResult.ok) {
          console.error("Falha ao processar pagamento Asaas:", storeResult.error);
        }
      }
    }
    if (eventType === "PAYMENT_DELETED") {
      await cancelAsaasRegistration(base44, paymentId);
      await cancelAsaasStoreOrder(base44, paymentId);
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error("asaasWebhook error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
