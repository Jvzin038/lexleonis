import { createClientFromRequest } from "../sdk.js";
import { ROLE_KEYS, permissionsFromRoles, requirePermission, staffProfileFor } from "../shared/staffAuth.js";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function cleanRoles(value) {
  const list = Array.isArray(value) ? value : [];
  return Array.from(new Set(list.map((item) => String(item)).filter((item) => ROLE_KEYS.includes(item))));
}
function userByEmail(base44, email) {
  return base44.asServiceRole.entities.User.filter({ email }, { limit: 1 }).then((page) => page?.items?.[0] || null).catch(() => null);
}
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const access = await requirePermission(base44, user, "usuarios");
    if (!access.ok) {
      return Response.json({ error: "Somente a diretoria com acesso a usuários pode convidar administradores." }, { status: 403 });
    }
    const service = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");
    const now = new Date().toISOString();
    const operatorName = user.full_name || user.email;
    if (action === "invite") {
      const email = String(body.email || "").trim().toLowerCase();
      const platformRole = body.role === "admin" ? "admin" : "user";
      const roles = cleanRoles(body.roles);
      if (!EMAIL_PATTERN.test(email)) {
        return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });
      }
      if (platformRole === "admin" && roles.length === 0) {
        return Response.json({ error: "Escolha a função do convidado no painel." }, { status: 400 });
      }
      if (!access.context.profile) {
        await service.entities.StaffProfile.create({
          user_id: user.id,
          user_email: user.email,
          user_name: operatorName,
          roles: ["admin_geral"],
          permissions: ["*"],
          active: true,
          invited_by: user.email,
          invited_by_name: operatorName,
          invited_at: now,
          note: "Acesso inicial registrado automaticamente"
        });
      }
      const target = await userByEmail(base44, email);
      const existing = await staffProfileFor(base44, email);
      if (platformRole === "admin") {
        const payload = {
          user_id: target?.id || existing?.user_id || "",
          user_email: email,
          user_name: target?.full_name || existing?.user_name || "",
          roles,
          permissions: permissionsFromRoles(roles),
          active: true,
          invited_by: user.email,
          invited_by_name: operatorName,
          invited_at: now,
          note: String(body.note || "").slice(0, 300)
        };
        if (existing)
          await service.entities.StaffProfile.update(existing.id, payload);
        else
          await service.entities.StaffProfile.create(payload);
        if (target && target.role !== "admin") {
          await service.entities.User.update(target.id, { role: "admin" });
        }
      }
      let invited = true;
      if (platformRole !== "admin") {
        try {
          await base44.users.inviteUser(email, platformRole);
        } catch (error) {
          invited = false;
        }
      }
      const message = platformRole === "admin" ? `Acesso liberado e instruções enviadas para ${email}.` : invited ? `Convite enviado para ${email}.` : `Não foi possível enviar o convite para ${email}.`;
      await service.entities.AdminLog.create({
        action: platformRole === "admin" ? "Convite de acesso ao painel" : "Convite de aluno",
        module: "Usuários e permissões",
        record_label: email,
        user_email: user.email,
        user_name: operatorName,
        details: roles.join(", ")
      });
      const proto = req.headers.get("x-forwarded-proto") || "https";
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
      const origin = host ? `${proto}://${host}` : "";
      const registerUrl = origin ? `${origin}/register?returnTo=${encodeURIComponent("/painel/entrar")}` : "";
      if (platformRole === "admin" && origin) {
        try {
          if (origin) {
            const settingsPage = await service.entities.SiteSettings.filter({}, { limit: 1 });
            const siteName = settingsPage?.items?.[0]?.site_name || "Atlética Lex Leonis";
            const loginUrl = `${origin}/painel/entrar`;
            const registerUrl = `${origin}/register?returnTo=${encodeURIComponent("/painel")}`;
            const forgotUrl = `${origin}/forgot-password`;
            const hasAccount = !!target;
            await service.integrations.Core.SendEmail({
              to: email,
              subject: `Convite — Painel da ${siteName}`,
              html: `<!DOCTYPE html><html><body style="font-family:Inter,Arial,sans-serif;color:#111;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="color:#24083F;margin-bottom:8px">Você foi convidado para a diretoria da ${siteName}</h2>
  <p style="color:#444;line-height:1.5">Olá! Seu acesso administrativo foi liberado com o e-mail <strong>${email}</strong>.</p>
  ${hasAccount ? `<p style="color:#444;line-height:1.5">Para entrar no painel:</p>
  <ol style="color:#444;line-height:1.7;padding-left:20px">
    <li>Acesse <a href="${loginUrl}" style="color:#6B16C5">${loginUrl}</a></li>
    <li>Entre com seu e-mail e senha</li>
  </ol>
  <p style="margin-top:20px;padding:14px 16px;background:#F4EEFA;border-radius:8px;font-size:14px;color:#444">
    Esqueceu a senha? Redefina aqui: <a href="${forgotUrl}" style="color:#6B16C5">${forgotUrl}</a>
  </p>` : `<p style="color:#444;line-height:1.5">Para entrar no painel:</p>
  <ol style="color:#444;line-height:1.7;padding-left:20px">
    <li>Crie sua conta em <a href="${registerUrl}" style="color:#6B16C5">${registerUrl}</a></li>
    <li>Confirme o código recebido por e-mail</li>
    <li>Após o cadastro, você será levado automaticamente ao painel</li>
  </ol>`}
  <p style="margin-top:20px;font-size:13px;color:#888">Se você não esperava este convite, ignore este e-mail.</p>
</body></html>`
            });
          }
        } catch (emailError) {}
      }
      return Response.json({ ok: true, invited, message, email, roles, registerUrl, hasAccount: !!target });
    }
    if (action === "permissions") {
      const userId = String(body.user_id || "");
      const email = String(body.user_email || "").trim().toLowerCase();
      const user_name = String(body.user_name || "");
      const roles = cleanRoles(body.roles);
      const active = body.active !== false;
      const explicit = Array.isArray(body.permissions) ? body.permissions.map(String) : [];
      if (!userId || !email) {
        return Response.json({ error: "Usuário inválido." }, { status: 400 });
      }
      if (email === String(user.email || "").toLowerCase() && (!active || roles.length === 0)) {
        return Response.json({ error: "Você não pode remover o próprio acesso ao painel." }, { status: 400 });
      }
      const existing = await staffProfileFor(base44, email);
      const payload = {
        user_id: userId,
        user_email: email,
        user_name,
        roles,
        permissions: Array.from(new Set([...permissionsFromRoles(roles), ...explicit])),
        active,
        invited_by: existing?.invited_by || user.email,
        invited_by_name: existing?.invited_by_name || operatorName,
        invited_at: existing?.invited_at || now,
        note: String(body.note || "").slice(0, 300)
      };
      if (existing)
        await service.entities.StaffProfile.update(existing.id, payload);
      else
        await service.entities.StaffProfile.create(payload);
      const shouldBeAdmin = active && roles.length > 0;
      await service.entities.User.update(userId, { role: shouldBeAdmin ? "admin" : "user" });
      await service.entities.AdminLog.create({
        action: shouldBeAdmin ? "Liberou acesso ao painel" : "Removeu acesso ao painel",
        module: "Usuários e permissões",
        record_label: email,
        user_email: user.email,
        user_name: operatorName,
        details: roles.join(", ")
      });
      return Response.json({ ok: true, message: "Permissões atualizadas." });
    }
    if (action === "remove") {
      const email = String(body.user_email || "").trim().toLowerCase();
      if (!EMAIL_PATTERN.test(email)) {
        return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });
      }
      if (email === String(user.email || "").toLowerCase()) {
        return Response.json({ error: "Você não pode remover o próprio acesso ao painel." }, { status: 400 });
      }
      const profile = await staffProfileFor(base44, email);
      const target = await userByEmail(base44, email);
      if (profile)
        await service.entities.StaffProfile.delete(profile.id);
      if (target)
        await service.entities.User.update(target.id, { role: "user" });
      await service.entities.AdminLog.create({
        action: "Acesso ao painel removido",
        module: "Usuários e permissões",
        record_label: email,
        user_email: user.email,
        user_name: operatorName,
        details: Array.isArray(profile?.roles) ? profile.roles.join(", ") : ""
      });
      return Response.json({
        ok: true,
        message: `Acesso ao painel removido de ${email}. A pessoa volta a ser apenas aluno.`
      });
    }
    return Response.json({ error: "Ação não reconhecida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
