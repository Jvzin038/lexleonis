const TZ_OFFSET = "-03:00";
const TIME_ZONE = "America/Sao_Paulo";
function isoDate(value) {
  return value ? String(value).slice(0, 10) : "";
}
function clock(value, fallback) {
  const raw = String(value || "").slice(0, 5);
  return /^\d{2}:\d{2}$/.test(raw) ? raw : fallback;
}
export function todayInSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date);
}
export function eventWindow(event, settings) {
  const startDate = isoDate(event?.start_date);
  const endDate = isoDate(event?.end_date || event?.start_date);
  const startClock = clock(event?.start_time, "00:00");
  const endClock = clock(event?.end_time, "23:59");
  const startsAt = startDate ? new Date(`${startDate}T${startClock}:00${TZ_OFFSET}`) : null;
  let endsAt = endDate ? new Date(`${endDate}T${endClock}:00${TZ_OFFSET}`) : startsAt;
  if (startsAt && endsAt && endsAt.getTime() < startsAt.getTime()) {
    endsAt = new Date(startsAt.getTime() + 3 * 60 * 60 * 1000);
  }
  const openHours = Number(settings?.entry_open_hours ?? 6);
  const validHours = Number(settings?.ticket_valid_hours_after_end ?? 0);
  const openAt = startsAt ? new Date(startsAt.getTime() - openHours * 60 * 60 * 1000) : null;
  const validUntil = endsAt ? new Date(endsAt.getTime() + validHours * 60 * 60 * 1000) : null;
  return { startsAt, endsAt, openAt, validUntil };
}
export function toIso(value) {
  if (!value)
    return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
export function formatCurrencyBR(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function formatDateBR(value) {
  const iso = isoDate(value);
  if (!iso)
    return "—";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day)
    return "—";
  return `${day}/${month}/${year}`;
}
export function formatDateTimeBR(value) {
  if (!value)
    return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime()))
    return "—";
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
  return formatted;
}
export function makeOrderNumber(prefix) {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase();
  return `${prefix}-${stamp}${random}`;
}
export function whatsappUrl(number, text) {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits)
    return "";
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  const message = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${withCountry}${message}`;
}
function intro(settings, fallback) {
  const custom = String(settings?.order_whatsapp_intro || "").trim();
  return custom || fallback;
}
export function ticketOrderMessage(order, settings, event) {
  const lines = [
    intro(settings, "Olá, Atlética Lex Leonis! Acabei de registrar um pedido de ingresso no site."),
    "",
    `Pedido: ${order.order_number || order.code || order.id}`,
    `Evento: ${order.event_title || event?.title || ""}`,
    event?.start_date ? `Data: ${formatDateBR(event.start_date)}${event.start_time ? ` às ${clock(event.start_time, "")}` : ""}` : "",
    `Tipo de ingresso: ${order.ticket_type_name || ""}`,
    `Quantidade: ${order.quantity || 1}`,
    `Valor unitário: ${formatCurrencyBR(order.unit_price)}`,
    `Total: ${formatCurrencyBR(order.total_amount)}`,
    "",
    "Meus dados",
    `Nome: ${order.user_name || ""}`,
    `Telefone: ${order.user_phone || ""}`,
    `E-mail: ${order.user_email || ""}`
  ];
  if (order.notes)
    lines.push(`Observações: ${order.notes}`);
  lines.push("");
  lines.push("Aguardo as instruções de pagamento para receber meus ingressos.");
  return lines.filter((line) => line !== undefined).join(`
`);
}
export function storeOrderMessage(order, items, settings) {
  const lines = [
    intro(settings, "Olá, Atlética Lex Leonis! Acabei de registrar um pedido na loja oficial."),
    "",
    `Pedido: ${order.order_number || order.id}`,
    `Nome: ${order.user_name || ""}`,
    `Contato: ${order.contact_phone || ""}`,
    `E-mail: ${order.user_email || ""}`,
    "",
    "Itens"
  ];
  (items || []).forEach((item) => {
    const variation = [item.size, item.variation].filter(Boolean).join(" / ");
    lines.push(`• ${item.quantity}x ${item.product_name}${variation ? ` (${variation})` : ""} — ${formatCurrencyBR(item.unit_price * item.quantity)}`);
  });
  lines.push("");
  lines.push(`Total: ${formatCurrencyBR(order.total_amount)}`);
  if (order.pickup_note)
    lines.push(`Observações: ${order.pickup_note}`);
  lines.push("");
  lines.push("Aguardo as instruções de pagamento e a confirmação do pedido.");
  return lines.join(`
`);
}
