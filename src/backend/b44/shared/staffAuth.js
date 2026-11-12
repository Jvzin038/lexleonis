const ROLE_PERMISSIONS = {
  admin_geral: ["*"],
  esportes: ["dashboard", "esportes", "momentos"],
  eventos: ["dashboard", "eventos", "inscricoes", "ingressos", "checkin", "mensagens"],
  financeiro: ["dashboard", "financeiro", "inscricoes", "ingressos", "pedidos"],
  comunicacao: ["dashboard", "noticias", "momentos", "paginas", "midia", "patrocinadores", "personalizar"],
  checkin: ["checkin"]
};
export const ROLE_KEYS = Object.keys(ROLE_PERMISSIONS);
export function permissionsFromRoles(roles) {
  const list = Array.isArray(roles) ? roles : [];
  if (list.includes("admin_geral"))
    return ["*"];
  const set = new Set;
  list.forEach((roleKey) => {
    const permissions = ROLE_PERMISSIONS[roleKey] || [];
    permissions.forEach((permission) => set.add(permission));
  });
  return Array.from(set);
}
export function hasPermission(permissions, permission) {
  if (!permission)
    return true;
  if (!Array.isArray(permissions))
    return false;
  return permissions.includes("*") || permissions.includes(permission);
}
function permissionsOfProfile(profile) {
  const roles = Array.isArray(profile?.roles) ? profile.roles : [];
  const explicit = Array.isArray(profile?.permissions) ? profile.permissions : [];
  return Array.from(new Set([...permissionsFromRoles(roles), ...explicit]));
}
export async function staffProfileFor(base44, email) {
  if (!email)
    return null;
  try {
    const page = await base44.asServiceRole.entities.StaffProfile.filter({ user_email: String(email).trim().toLowerCase() }, { limit: 1 });
    return page?.items?.[0] || null;
  } catch (error) {
    return null;
  }
}
export async function staffPermissions(base44, user) {
  if (!user || !user.email) {
    return { isStaff: false, permissions: [], roles: [], profile: null, invitedBy: null, founder: false };
  }
  const profile = await staffProfileFor(base44, user.email);
  if (profile && profile.active !== false) {
    const roles = Array.isArray(profile.roles) ? profile.roles : [];
    const permissions = permissionsOfProfile(profile);
    if (permissions.length > 0 && user.role !== "admin" && user.id) {
      try {
        await base44.asServiceRole.entities.User.update(user.id, { role: "admin" });
      } catch (syncError) {}
    }
    if (permissions.length > 0 && !profile.user_id && user.id) {
      try {
        await base44.asServiceRole.entities.StaffProfile.update(profile.id, { user_id: user.id });
      } catch (linkError) {}
    }
    return {
      isStaff: permissions.length > 0,
      permissions,
      roles,
      profile,
      invitedBy: profile.invited_by || null,
      founder: false
    };
  }
  if (user.role === "admin") {
    let registered = 0;
    try {
      registered = await base44.asServiceRole.entities.StaffProfile.count({});
    } catch (error) {
      registered = 0;
    }
    if (!registered) {
      return {
        isStaff: true,
        permissions: ["*"],
        roles: ["admin_geral"],
        profile: null,
        invitedBy: null,
        founder: true
      };
    }
  }
  return { isStaff: false, permissions: [], roles: [], profile, invitedBy: null, founder: false };
}
export async function isStaffMember(base44, user) {
  const context = await staffPermissions(base44, user);
  return context.isStaff;
}
export async function requirePermission(base44, user, permission) {
  const context = await staffPermissions(base44, user);
  if (!context.isStaff || !hasPermission(context.permissions, permission)) {
    return { ok: false, context };
  }
  return { ok: true, context };
}
export function uniqueTicketCode() {
  const random = globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
  return `LL${random}`;
}
