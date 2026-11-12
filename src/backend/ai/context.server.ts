// Builds the data summaries the assistants read. Public context only uses publicly visible records.
type Admin = any;

const today = () => new Date().toISOString().slice(0, 10);
const brl = (n: number) => `R$ ${Number(n || 0).toFixed(2).replace(".", ",")}`;

export async function publicContext(admin: Admin) {
  const [ev, tt, pr, faq, st] = await Promise.all([
    admin.from("event").select("id,title,start_date,start_time,location_name,address,registration_mode,status,short_description,age_rating").neq("status", "draft").gte("start_date", today()).order("start_date").limit(30),
    admin.from("ticket_type").select("event_id,event_title,name,price,is_free,quantity_total,quantity_sold,quantity_reserved,sales_end,max_per_buyer").eq("active", true).limit(80),
    admin.from("product").select("name,price,promo_price,stock,preorder,sizes,description").eq("status", "published").limit(60),
    admin.from("faq_item").select("question,answer").eq("active", true).order("order").limit(60),
    admin.from("site_settings").select("*").limit(1),
  ]);
  const events = (ev.data || []).map((e: any) => {
    const lots = (tt.data || []).filter((t: any) => t.event_id === e.id).map((t: any) => {
      const left = Math.max(0, Number(t.quantity_total || 0) - Number(t.quantity_sold || 0) - Number(t.quantity_reserved || 0));
      return `${t.name}: ${t.is_free ? "gratuito" : brl(t.price)}, ${left} disponíveis`;
    });
    return `- ${e.title} | ${e.start_date}${e.start_time ? " " + e.start_time : ""} | ${e.location_name || "local a definir"} | status ${e.status} | link /eventos/${e.id}${lots.length ? " | lotes: " + lots.join("; ") : ""}${e.short_description ? " | " + e.short_description : ""}`;
  });
  const products = (pr.data || []).map((p: any) => `- ${p.name}: ${brl(p.promo_price || p.price)}${p.stock > 0 ? "" : p.preorder ? " (pré-venda)" : " (esgotado)"}`);
  const faqs = (faq.data || []).map((f: any) => `P: ${f.question}\nR: ${f.answer}`);
  const s = st.data?.[0] || {};
  const contact = [s.contact_email, s.contact_phone, s.instagram].filter(Boolean).join(" · ");
  return [
    `Hoje é ${today()}.`,
    `PRÓXIMOS EVENTOS:\n${events.join("\n") || "Nenhum evento publicado."}`,
    `LOJA OFICIAL (/loja):\n${products.join("\n") || "Nenhum produto publicado."}`,
    `PERGUNTAS FREQUENTES:\n${faqs.join("\n\n") || "Nenhuma cadastrada."}`,
    `CONTATO: ${contact || "use a página /contato"}`,
  ].join("\n\n");
}

export async function dashboardContext(admin: Admin, days: number) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const [regs, orders, products, events] = await Promise.all([
    admin.from("registration").select("event_title,status,payment_status,quantity,total_amount,created_date").gte("created_date", since).limit(5000),
    admin.from("store_order").select("status,payment_status,total_amount,created_date").gte("created_date", since).limit(5000),
    admin.from("product").select("name,stock,low_stock_alert,status").eq("status", "published").limit(200),
    admin.from("event").select("title,start_date,status").gte("start_date", today()).order("start_date").limit(15),
  ]);
  const byEvent: Record<string, { q: number; paid: number; pending: number }> = {};
  for (const r of regs.data || []) {
    const k = r.event_title || "Sem evento";
    byEvent[k] ??= { q: 0, paid: 0, pending: 0 };
    if (r.status === "confirmed") { byEvent[k].q += Number(r.quantity || 1); byEvent[k].paid += Number(r.total_amount || 0); }
    else if (r.status === "pending") byEvent[k].pending += Number(r.quantity || 1);
  }
  const ord = orders.data || [];
  const paidOrders = ord.filter((o: any) => o.payment_status === "paid" || o.status === "paid" || o.status === "delivered");
  const low = (products.data || []).filter((p: any) => Number(p.stock || 0) <= Number(p.low_stock_alert || 5));
  return [
    `Período analisado: últimos ${days} dias (até ${today()}).`,
    `INSCRIÇÕES POR EVENTO (confirmadas / receita / pendentes):\n${Object.entries(byEvent).map(([k, v]) => `- ${k}: ${v.q} / ${brl(v.paid)} / ${v.pending}`).join("\n") || "Nenhuma inscrição no período."}`,
    `LOJA: ${ord.length} pedidos, ${paidOrders.length} pagos, receita ${brl(paidOrders.reduce((s: number, o: any) => s + Number(o.total_amount || 0), 0))}.`,
    `ESTOQUE BAIXO:\n${low.map((p: any) => `- ${p.name}: ${p.stock}`).join("\n") || "Nenhum."}`,
    `PRÓXIMOS EVENTOS:\n${(events.data || []).map((e: any) => `- ${e.title} (${e.start_date}, ${e.status})`).join("\n") || "Nenhum."}`,
  ].join("\n\n");
}
