// Server-side stand-in for the Base44 SDK used by the ported backend actions.
// Data access runs with the service role; the caller identity is resolved by the dispatcher.
import { ENTITY_TABLES, createEntity } from '../../lib/entity-core.js';
import { encryptCpf } from './shared/cpfCrypto.js';

const contextByRequest = new WeakMap();

export function bindRequestContext(req, ctx) {
  contextByRequest.set(req, ctx);
  return req;
}

export const secrets = { get: (key) => process.env[key] };

export async function loadUser(admin, authUserId) {
  if (!authUserId) return null;
  const [{ data: profile }, { data: roles }, { data: authData }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', authUserId).maybeSingle(),
    admin.from('user_roles').select('role').eq('user_id', authUserId),
    admin.auth.admin.getUserById(authUserId),
  ]);
  const authUser = authData?.user;
  if (!authUser) return null;
  const isAdmin = (roles || []).some((r) => r.role === 'admin');
  return {
    ...(profile?.data || {}),
    id: authUser.id,
    email: (authUser.email || '').toLowerCase(),
    full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
    phone: profile?.phone || '',
    cpf: profile?.cpf || '',
    course: profile?.course || '',
    role: isAdmin ? 'admin' : 'user',
    created_date: authUser.created_at,
  };
}

function userEntity(admin) {
  const list = async () => {
    const { data: profiles } = await admin.from('profiles').select('*').limit(1000);
    const { data: roles } = await admin.from('user_roles').select('user_id, role');
    const adminIds = new Set((roles || []).filter((r) => r.role === 'admin').map((r) => r.user_id));
    const items = (profiles || []).map((p) => ({ ...(p.data || {}), id: p.id, email: p.email, full_name: p.full_name, role: adminIds.has(p.id) ? 'admin' : 'user', created_date: p.created_date }));
    return { items };
  };
  return {
    list,
    async filter(filter = {}) {
      const { items } = await list();
      return { items: items.filter((u) => Object.entries(filter).every(([k, v]) => String(u[k] ?? '').toLowerCase() === String(v ?? '').toLowerCase())) };
    },
    async get(id) { return loadUser(admin, id); },
    async update(id, payload = {}) {
      const { role, full_name, phone, cpf, course, ...rest } = payload;
      if (role === 'admin') await admin.from('user_roles').upsert({ user_id: id, role: 'admin' }, { onConflict: 'user_id,role' });
      if (role === 'user') await admin.from('user_roles').delete().eq('user_id', id).eq('role', 'admin');
      const patch = {};
      if (full_name !== undefined) patch.full_name = full_name;
      if (phone !== undefined) patch.phone = phone;
      if (cpf !== undefined) patch.cpf = encryptCpf(cpf);
      if (course !== undefined) patch.course = course;
      if (Object.keys(rest).length) {
        const { data: cur } = await admin.from('profiles').select('data').eq('id', id).maybeSingle();
        patch.data = { ...(cur?.data || {}), ...rest };
      }
      if (Object.keys(patch).length) await admin.from('profiles').update(patch).eq('id', id);
      return loadUser(admin, id);
    },
  };
}

function entitiesFor(admin) {
  return new Proxy({}, {
    get(_, name) {
      if (name === 'User') return userEntity(admin);
      const table = ENTITY_TABLES[name];
      if (!table) throw new Error(`Entidade desconhecida: ${String(name)}`);
      return createEntity(admin, table);
    },
  });
}

export function createClientFromRequest(req) {
  const ctx = contextByRequest.get(req);
  if (!ctx) throw new Error('Contexto do servidor ausente.');
  const { admin, user } = ctx;
  const entities = entitiesFor(admin);
  return {
    auth: { me: async () => user },
    entities,
    asServiceRole: { entities, db: admin },
    users: {
      async inviteUser(email, _role) {
        const origin = ctx.origin || '';
        const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: `${origin}/painel/entrar` });
        if (error && !/already/i.test(error.message)) throw error;
        return { ok: true };
      },
    },
  };
}
