import { createClientFromRequest } from "../sdk.js";
import { requirePermission } from "../shared/staffAuth.js";
const PERMISSION = "pedidos";
const STATUS_OPTIONS = ["awaiting_contact", "awaiting_payment", "in_production", "ready", "delivered"];
const FINAL_STATUSES = ["cancelled", "refunded"];
async function writeLog(base44, user, action, order, details) {
  await base44.asServiceRole.entities.AdminLog.create({
    action,
    module: "Pedidos da loja",
    record_label: order?.order_number || order?.id || "",
    user_email: user.email || "",
    user_name: user.full_name || "",
    details: details || ""
  });
}
async function loadItems(base44, order) {
  const page = await base44.asServiceRole.entities.OrderItem.filter({ order_id: order.id }, { sort: "created_date", limit: 100 });
  return page?.items || [];
}
async function loadHistory(base44, order) {
  const page = await base44.asServiceRole.entities.AdminLog.filter({ module: "Pedidos da loja", record_label: order.order_number || order.id }, { sort: "-created_date", limit: 50 });
  return page?.items || [];
}
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const access = await requirePermission(base44, user, PERMISSION);
    if (!access.ok) {
      return Response.json({ error: "Sua conta não tem permissão para gerenciar pedidos." }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "list");
    if (action === "list") {
      const baseQuery = {};
      if (body.status)
        baseQuery.status = String(body.status);
      if (body.payment_status)
        baseQuery.payment_status = String(body.payment_status);
      const query = { ...baseQuery };
      const search = String(body.search || "").trim();
      if (search) {
        query.$or = [
          { order_number: { $regex: search, $options: "i" } },
          { user_name: { $regex: search, $options: "i" } },
          { contact_phone: { $regex: search, $options: "i" } }
        ];
      }
      const [page, byStatus, byPayment] = await Promise.all([
        base44.asServiceRole.entities.Order.filter(query, { sort: "-created_date", limit: 200 }),
        base44.asServiceRole.entities.Order.aggregate({ query: {}, groupBy: "status" }),
        base44.asServiceRole.entities.Order.aggregate({ query: {}, groupBy: "payment_status" })
      ]);
      return Response.json({
        items: page?.items || [],
        counts: { status: byStatus?.rows || [], payment: byPayment?.rows || [] }
      });
    }
    const orderId = String(body.id || "").trim();
    if (!orderId)
      return Response.json({ error: "Informe o pedido." }, { status: 400 });
    const order = await base44.asServiceRole.entities.Order.get(orderId).catch(() => null);
    if (!order)
      return Response.json({ error: "Pedido não encontrado." }, { status: 404 });
    if (action === "detail") {
      const [items, history] = await Promise.all([loadItems(base44, order), loadHistory(base44, order)]);
      return Response.json({ order, items, history });
    }
    if (action === "note") {
      const note = String(body.admin_note || "").slice(0, 1000);
      const updated = await base44.asServiceRole.entities.Order.update(order.id, { admin_note: note });
      await writeLog(base44, user, "Observação interna atualizada", order, note.slice(0, 200));
      return Response.json({ order: updated });
    }
    if (FINAL_STATUSES.includes(order.status)) {
      return Response.json({ error: "Pedido cancelado ou reembolsado não pode ser alterado." }, { status: 409 });
    }
    if (action === "confirm_payment") {
      if (body.confirmed !== true) {
        return Response.json({ error: "A confirmação do pagamento precisa ser confirmada." }, { status: 400 });
      }
      if (order.payment_status === "confirmed") {
        return Response.json({ order, already: true });
      }
      const updated = await base44.asServiceRole.entities.Order.update(order.id, {
        status: "paid",
        payment_status: "confirmed",
        confirmed_by: user.email || "",
        confirmed_by_name: user.full_name || "",
        confirmed_at: new Date().toISOString()
      });
      await writeLog(base44, user, "Pagamento do pedido confirmado", order, "Status alterado para pago.");
      return Response.json({ order: updated });
    }
    if (action === "set_status") {
      const status = String(body.status || "");
      if (!STATUS_OPTIONS.includes(status)) {
        return Response.json({ error: "Situação não permitida." }, { status: 400 });
      }
      if (status !== "awaiting_contact" && status !== "awaiting_payment" && order.payment_status !== "confirmed") {
        return Response.json({ error: "Confirme o pagamento antes de avançar a produção do pedido." }, { status: 409 });
      }
      const updated = await base44.asServiceRole.entities.Order.update(order.id, { status });
      await writeLog(base44, user, "Situação do pedido atualizada", order, `Nova situação: ${status}.`);
      return Response.json({ order: updated });
    }
    if (action === "cancel" || action === "refund") {
      const reason = String(body.reason || "").trim();
      if (reason.length < 3) {
        return Response.json({ error: "Informe o motivo." }, { status: 400 });
      }
      const refund = action === "refund";
      if (order.stock_released !== true) {
        const items = await loadItems(base44, order);
        for (const item of items) {
          if (item.track_stock === false)
            continue;
          await base44.asServiceRole.entities.Product.updateMany({ id: item.product_id }, { $inc: { stock: Number(item.quantity || 0) } });
        }
        await base44.asServiceRole.entities.Order.update(order.id, { stock_released: true });
      }
      const updated = await base44.asServiceRole.entities.Order.update(order.id, {
        status: refund ? "refunded" : "cancelled",
        payment_status: refund ? "refunded" : "cancelled",
        cancel_reason: reason
      });
      await writeLog(base44, user, refund ? "Pedido reembolsado" : "Pedido cancelado", order, `${reason} — estoque devolvido.`);
      return Response.json({ order: updated });
    }
    return Response.json({ error: "Ação não reconhecida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
