import { createClientFromRequest } from "../sdk.js";
import QRCode from "qrcode";
import { requirePermission } from "../shared/staffAuth.js";
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const code = String(body.code || "").trim().toUpperCase();
    if (!code)
      return Response.json({ error: "Informe o código do ingresso." }, { status: 400 });
    const found = await base44.asServiceRole.entities.Ticket.filter({ code }, { limit: 1 });
    const ticket = found?.items?.[0];
    if (!ticket)
      return Response.json({ error: "Ingresso não encontrado." }, { status: 404 });
    if (ticket.user_id !== user.id) {
      const access = await requirePermission(base44, user, "ingressos");
      if (!access.ok) {
        return Response.json({ error: "Sua conta não tem acesso a este ingresso." }, { status: 403 });
      }
    }
    const qr = QRCode.create(ticket.code, { errorCorrectionLevel: "M" });
    const size = qr.modules.size;
    const data = qr.modules.data;
    const rows = [];
    for (let row = 0;row < size; row += 1) {
      let line = "";
      for (let col = 0;col < size; col += 1) {
        line += (data[row * size + col] & 1) === 1 ? "1" : "0";
      }
      rows.push(line);
    }
    return Response.json({ code: ticket.code, size, rows });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
