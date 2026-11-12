// Base44-compatible entity API on top of Lovable Cloud tables.
// Shared by the browser client (RLS applies) and server actions (service role).
export const ENTITY_TABLES = {
  AdminLog: 'admin_log', Athlete: 'athlete', BoardMember: 'board_member', CheckInLog: 'check_in_log',
  ContactMessage: 'contact_message', Event: 'event', EventCategory: 'event_category', FaqItem: 'faq_item',
  GalleryAlbum: 'gallery_album', GalleryImage: 'gallery_image', HomeSection: 'home_section', Match: 'match',
  MediaFile: 'media_file', NavItem: 'nav_item', Order: 'store_order', OrderItem: 'order_item', Post: 'post',
  Product: 'product', ProdutoCategoria: 'produto_categoria', Registration: 'registration',
  SiteSettings: 'site_settings', Sponsor: 'sponsor', Sport: 'sport', StaffProfile: 'staff_profile',
  Standing: 'standing', StaticPage: 'static_page', Ticket: 'ticket', TicketType: 'ticket_type',
};

const PAGE = 1000;

function applyFilter(q, filter) {
  for (const [key, value] of Object.entries(filter || {})) {
    if (value === undefined) continue;
    if (key === '$or' && Array.isArray(value)) {
      const parts = value.flatMap((cond) => Object.entries(cond).map(([k, v]) => `${k}.eq.${v}`));
      q = q.or(parts.join(','));
      continue;
    }
    if (value === null) { q = q.is(key, null); continue; }
    if (typeof value === 'object' && !Array.isArray(value)) {
      for (const [op, v] of Object.entries(value)) {
        if (op === '$ne') q = v === null ? q.not(key, 'is', null) : q.or(`${key}.neq.${v},${key}.is.null`);
        else if (op === '$in') q = q.in(key, v);
        else if (op === '$nin') q = q.not(key, 'in', `(${v.map((x) => `"${x}"`).join(',')})`);
        else if (op === '$gte') q = q.gte(key, v);
        else if (op === '$gt') q = q.gt(key, v);
        else if (op === '$lte') q = q.lte(key, v);
        else if (op === '$lt') q = q.lt(key, v);
        else if (op === '$exists') q = v ? q.not(key, 'is', null) : q.is(key, null);
        else if (op === '$regex') q = q.filter(key, value.$options?.includes('i') ? 'imatch' : 'match', v);
      }
      continue;
    }
    q = q.eq(key, value);
  }
  return q;
}

function applySort(q, sort) {
  if (!sort) return q.order('created_date', { ascending: false });
  const fields = Array.isArray(sort) ? sort : String(sort).split(',');
  for (const f of fields) {
    const desc = f.startsWith('-');
    q = q.order(desc ? f.slice(1) : f, { ascending: !desc, nullsFirst: false });
  }
  return q;
}

function fail(error) {
  const err = new Error(error?.message || 'Erro ao acessar os dados.');
  err.status = error?.code === '42501' ? 403 : 400;
  err.response = { data: { error: err.message }, status: err.status };
  throw err;
}

export function createEntity(supabase, table) {
  const fetchRows = async (filter, opts = {}) => {
    const limit = opts.limit ?? 500;
    const skip = opts.skip ?? opts.offset ?? 0;
    const rows = [];
    let from = skip;
    while (rows.length < limit) {
      const size = Math.min(PAGE, limit - rows.length);
      let q = supabase.from(table).select('*');
      q = applySort(applyFilter(q, filter), opts.sort).range(from, from + size - 1);
      const { data, error } = await q;
      if (error) fail(error);
      rows.push(...data);
      if (data.length < size) break;
      from += size;
    }
    return rows;
  };

  const api = {
    async filter(filter = {}, opts = {}, legacyLimit) {
      if (typeof opts === 'string') opts = { sort: opts, limit: legacyLimit };
      const items = await fetchRows(filter, opts);
      return { items, total: items.length };
    },
    async list(opts = {}, legacyLimit) {
      if (typeof opts === 'string') opts = { sort: opts, limit: legacyLimit };
      return api.filter({}, opts || {});
    },
    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      if (error) fail(error);
      if (!data) { const e = new Error('Registro não encontrado.'); e.status = 404; throw e; }
      return data;
    },
    async create(payload) {
      const { data, error } = await supabase.from(table).insert(clean(payload)).select().single();
      if (error) fail(error);
      return data;
    },
    async bulkCreate(list) {
      if (!list?.length) return [];
      const { data, error } = await supabase.from(table).insert(list.map(clean)).select();
      if (error) fail(error);
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase.from(table).update(clean(payload)).eq('id', id).select().maybeSingle();
      if (error) fail(error);
      return data;
    },
    async bulkUpdate(list) {
      const out = [];
      for (const { id, ...rest } of list || []) out.push(await api.update(id, rest));
      return out;
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) fail(error);
      return { success: true };
    },
    async deleteMany(filter) {
      const { error } = await applyFilter(supabase.from(table).delete(), filter);
      if (error) fail(error);
      return { success: true };
    },
    async count(filter = {}) {
      const { count, error } = await applyFilter(supabase.from(table).select('id', { count: 'exact', head: true }), filter);
      if (error) fail(error);
      return count || 0;
    },
    async updateMany(filter, update) {
      const set = update?.$set || (update?.$inc ? null : update) || {};
      const inc = update?.$inc || {};
      const { data, error } = await supabase.rpc('entity_update_many', { t: table, filter, set_values: set, inc_values: inc });
      if (error) fail(error);
      return { updated: data };
    },
    async aggregate({ query = {}, groupBy, sum, dateBucket, limit, sort } = {}) {
      const rows = await fetchRows(query, { limit: 100000 });
      const sums = sum ? (Array.isArray(sum) ? sum : [sum]) : [];
      const groups = new Map();
      for (const row of rows) {
        let keyObj = {};
        if (groupBy) keyObj[groupBy] = row[groupBy] ?? null;
        if (dateBucket) {
          const raw = String(row[dateBucket.field] || '');
          keyObj[dateBucket.field] = dateBucket.unit === 'day' ? raw.slice(0, 10) : dateBucket.unit === 'year' ? raw.slice(0, 4) : raw.slice(0, 7);
        }
        const k = JSON.stringify(keyObj);
        if (!groups.has(k)) groups.set(k, { ...keyObj, count: 0, ...Object.fromEntries(sums.map((s) => [`sum_${s}`, 0])) });
        const g = groups.get(k);
        g.count += 1;
        for (const s of sums) g[`sum_${s}`] += Number(row[s] || 0);
      }
      let out = Array.from(groups.values());
      if (sort) {
        const desc = sort.startsWith('-');
        const f = desc ? sort.slice(1) : sort;
        out.sort((a, b) => (a[f] > b[f] ? 1 : a[f] < b[f] ? -1 : 0) * (desc ? -1 : 1));
      } else if (dateBucket) {
        out.sort((a, b) => String(a[dateBucket.field]).localeCompare(String(b[dateBucket.field])));
      }
      if (limit) out = out.slice(0, limit);
      return { rows: out };
    },
  };
  return api;
}

function clean(payload) {
  const out = {};
  for (const [k, v] of Object.entries(payload || {})) {
    if (v === undefined) continue;
    if (k === 'id' && !v) continue;
    out[k] = v;
  }
  return out;
}
