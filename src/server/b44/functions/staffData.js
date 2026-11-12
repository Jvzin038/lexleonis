import { createClientFromRequest } from "../sdk.js";
import { hasPermission, staffPermissions } from "../shared/staffAuth.js";
const TIME_ZONE = "America/Sao_Paulo";
function todayIso() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date);
}
function sinceIso(days) {
  const date = new Date;
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}
function monthLabel(value) {
  const iso = String(value || "").slice(0, 7);
  const [year, month] = iso.split("-");
  if (!year || !month)
    return "—";
  return `${month}/${year}`;
}
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const context = await staffPermissions(base44, user);
    if (!context.isStaff) {
      return Response.json({ error: "Sua conta não tem acesso ao painel administrativo." }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "dashboard");
    if (action === "sync") {
      return Response.json({ ok: true, isStaff: context.isStaff });
    }
    if (action === "dashboard") {
      if (!hasPermission(context.permissions, "dashboard")) {
        return Response.json({ error: "Sua função não inclui o resumo do painel." }, { status: 403 });
      }
      const today = todayIso();
      const since = sinceIso(Math.max(1, Math.floor(Number(body.period || 90))));
      const [events, upcoming, registrations, tickets, revenue, ordersByPayment, chart, topEvents] = await Promise.all([
        base44.asServiceRole.entities.Event.count({}),
        base44.asServiceRole.entities.Event.count({ status: "published", start_date: { $gte: today } }),
        base44.asServiceRole.entities.Registration.count({ status: "confirmed" }),
        base44.asServiceRole.entities.Ticket.count({ status: { $ne: "cancelled" } }),
        base44.asServiceRole.entities.Registration.aggregate({
          query: { payment_status: "confirmed" },
          sum: "total_amount"
        }),
        base44.asServiceRole.entities.Order.aggregate({
          query: {},
          groupBy: "payment_status",
          sum: "total_amount",
          limit: 20
        }),
        base44.asServiceRole.entities.Registration.aggregate({
          query: { payment_status: "confirmed", created_date: { $gte: since } },
          dateBucket: { field: "created_date", unit: "month" },
          sum: "total_amount"
        }),
        base44.asServiceRole.entities.Registration.aggregate({
          query: { status: { $ne: "cancelled" } },
          groupBy: "event_title",
          sum: ["quantity", "total_amount"],
          limit: 6,
          sort: "-sum_quantity"
        })
      ]);
      const orderRows = ordersByPayment?.rows || [];
      const orderRevenue = orderRows.reduce((sum, row) => sum + Number(row.sum_total_amount || 0), 0);
      const ordersCount = orderRows.reduce((sum, row) => sum + Number(row.count || 0), 0);
      return Response.json({
        counts: { events, upcoming, registrations, tickets },
        confirmedRevenue: Number(revenue?.rows?.[0]?.sum_total_amount || 0),
        orderRevenue,
        ordersCount,
        chart: (chart?.rows || []).map((row) => {
          const bucketKey = Object.keys(row).find((key) => key !== "count" && !key.startsWith("sum_") && !key.startsWith("avg_"));
          return { label: monthLabel(bucketKey ? row[bucketKey] : ""), valor: Number(row.sum_total_amount || 0) };
        }),
        topEvents: topEvents?.rows || []
      });
    }
    if (action === "finance") {
      if (!hasPermission(context.permissions, "financeiro")) {
        return Response.json({ error: "Sua função não inclui o relatório financeiro." }, { status: 403 });
      }
      const [registrationRows, orderRows, byEvent, list] = await Promise.all([
        base44.asServiceRole.entities.Registration.aggregate({
          query: {},
          groupBy: "payment_status",
          sum: ["total_amount", "quantity"],
          limit: 20
        }),
        base44.asServiceRole.entities.Order.aggregate({
          query: {},
          groupBy: "payment_status",
          sum: "total_amount",
          limit: 20
        }),
        base44.asServiceRole.entities.Registration.aggregate({
          query: { payment_status: "confirmed" },
          groupBy: "event_title",
          sum: ["total_amount", "quantity"],
          limit: 30,
          sort: "-sum_total_amount"
        }),
        base44.asServiceRole.entities.Registration.filter({}, { sort: "-created_date", limit: 300 })
      ]);
      return Response.json({
        registrationRows: registrationRows?.rows || [],
        orderRows: orderRows?.rows || [],
        byEvent: byEvent?.rows || [],
        registrations: list?.items || []
      });
    }
    return Response.json({ error: "Ação não reconhecida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
