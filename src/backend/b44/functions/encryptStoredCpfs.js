import { createClientFromRequest } from "../sdk.js";
import { encryptCpf, isEncryptedCpf, maskCpf } from "../shared/cpfCrypto.js";

// Criptografa os CPFs/CNPJs que ainda estão abertos no banco (dados antigos ou
// importados). Ingressos guardam só a versão mascarada. Só administradores podem
// rodar, e rodar de novo não altera o que já foi protegido.
const PAGE = 500;

function needsEncryption(value) {
  const text = String(value || "");
  return Boolean(text) && !isEncryptedCpf(text) && !text.includes("*");
}

async function allRows(db, table, columns, key) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db.from(table).select(columns).order(key).range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data || []));
    if (!data || data.length < PAGE) return rows;
  }
}

async function update(db, table, key, id, patch) {
  const { error } = await db.from(table).update(patch).eq(key, id);
  if (error) throw new Error(`${table}: ${error.message}`);
}

function withEncryptedDataCpf(data) {
  if (!data || typeof data !== "object" || !needsEncryption(data.cpf)) return null;
  return { ...data, cpf: encryptCpf(data.cpf) };
}

export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Acesso restrito a administradores" }, { status: 403 });
    const db = base44.asServiceRole.db;
    encryptCpf("00000000000");
    const counts = { pedidos_ingresso: 0, pedidos_loja: 0, ingressos: 0, perfis: 0, contas_antigas: 0 };

    for (const row of await allRows(db, "registration", "id, buyer_cpf, participants", "id")) {
      const patch = {};
      if (needsEncryption(row.buyer_cpf)) patch.buyer_cpf = encryptCpf(row.buyer_cpf);
      const participants = Array.isArray(row.participants) ? row.participants : [];
      if (participants.some((p) => needsEncryption(p?.cpf))) {
        patch.participants = participants.map((p) => (needsEncryption(p?.cpf) ? { ...p, cpf: encryptCpf(p.cpf) } : p));
      }
      if (Object.keys(patch).length) {
        await update(db, "registration", "id", row.id, patch);
        counts.pedidos_ingresso += 1;
      }
    }

    for (const row of await allRows(db, "store_order", "id, buyer_cpf", "id")) {
      if (!needsEncryption(row.buyer_cpf)) continue;
      await update(db, "store_order", "id", row.id, { buyer_cpf: encryptCpf(row.buyer_cpf) });
      counts.pedidos_loja += 1;
    }

    for (const row of await allRows(db, "ticket", "id, participant_cpf", "id")) {
      if (!needsEncryption(row.participant_cpf)) continue;
      await update(db, "ticket", "id", row.id, { participant_cpf: maskCpf(row.participant_cpf) });
      counts.ingressos += 1;
    }

    for (const row of await allRows(db, "profiles", "id, cpf, data", "id")) {
      const patch = {};
      if (needsEncryption(row.cpf)) patch.cpf = encryptCpf(row.cpf);
      const data = withEncryptedDataCpf(row.data);
      if (data) patch.data = data;
      if (Object.keys(patch).length) {
        await update(db, "profiles", "id", row.id, patch);
        counts.perfis += 1;
      }
    }

    for (const row of await allRows(db, "legacy_user_map", "base44_user_id, data", "base44_user_id")) {
      const data = withEncryptedDataCpf(row.data);
      if (!data) continue;
      await update(db, "legacy_user_map", "base44_user_id", row.base44_user_id, { data });
      counts.contas_antigas += 1;
    }

    await base44.asServiceRole.entities.AdminLog.create({
      action: "CPFs existentes criptografados",
      module: "Segurança",
      record_label: "Criptografia de CPF",
      user_email: user.email || "",
      user_name: user.full_name || "",
      details: JSON.stringify(counts)
    });
    return Response.json({ ok: true, ...counts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
