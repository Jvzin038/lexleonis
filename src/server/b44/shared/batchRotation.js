import { todayInSaoPaulo } from "./ticketRules.js";
function isoDate(value) {
  return value ? String(value).slice(0, 10) : "";
}
export function batchStatus(batch, today) {
  const mode = batch.rotation_mode || "sold_out";
  const soldOut = batch.quantity_total > 0 && Number(batch.quantity_sold || 0) >= Number(batch.quantity_total || 0);
  const pastEnd = batch.sales_end && isoDate(batch.sales_end) < today;
  const beforeStart = batch.sales_start && isoDate(batch.sales_start) > today;
  let status = "available";
  if (beforeStart)
    status = "scheduled";
  else if (soldOut && pastEnd)
    status = "closed";
  else if (soldOut)
    status = "sold_out";
  else if (pastEnd)
    status = "closed";
  const shouldDeactivate = batch.active && mode !== "manual" && (mode === "sold_out" && soldOut || mode === "date" && pastEnd || mode === "both" && (soldOut || pastEnd));
  return { status, soldOut, pastEnd, beforeStart, shouldDeactivate };
}
export async function evaluateEventBatches(base44, eventId) {
  if (!eventId)
    return { changes: [] };
  const today = todayInSaoPaulo();
  const page = await base44.asServiceRole.entities.TicketType.filter({ event_id: eventId }, { sort: "order", limit: 100 });
  const batches = (page?.items || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  const changes = [];
  for (const batch of batches) {
    const info = batchStatus(batch, today);
    if (info.shouldDeactivate) {
      await base44.asServiceRole.entities.TicketType.update(batch.id, { active: false });
      changes.push({ id: batch.id, name: batch.name, action: "deactivated", reason: info.soldOut ? "sold_out" : "date" });
    }
  }
  const hasActiveWithStock = batches.some((b) => b.active && batchStatus(b, today).status === "available");
  if (!hasActiveWithStock) {
    const nextBatch = batches.find((b) => !b.active && batchStatus(b, today).status === "available");
    if (nextBatch) {
      await base44.asServiceRole.entities.TicketType.update(nextBatch.id, { active: true });
      changes.push({ id: nextBatch.id, name: nextBatch.name, action: "activated" });
    }
  }
  return { changes };
}
