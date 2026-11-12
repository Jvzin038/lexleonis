import { createClientFromRequest } from "../sdk.js";
export default async function input_default(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user)
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    if (user.role !== "admin")
      return Response.json({ error: "Acesso restrito a administradores" }, { status: 403 });
    const { items: profiles } = await base44.asServiceRole.entities.StaffProfile.filter({}, { limit: 500 });
    const profileIds = profiles.map((p) => p.id);
    if (profileIds.length > 0) {
      await base44.asServiceRole.entities.StaffProfile.deleteMany({ id: { $in: profileIds } });
    }
    return Response.json({
      deleted: profileIds.length,
      emails: profiles.map((p) => p.user_email)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
