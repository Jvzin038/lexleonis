// Browser-side replacement for the original Base44 SDK client.
// Same method names, backed by Lovable Cloud (database, auth, storage, server actions).
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { ENTITY_TABLES, createEntity } from '@/lib/entity-core';
import { invokeAction } from '@/backend/invoke.functions';
import { claimLegacyAccount } from '@/backend/account.functions';

let claimed = false;

async function currentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (!claimed && user.email_confirmed_at) {
    claimed = true;
    try { await claimLegacyAccount(); } catch { /* best effort */ }
  }
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', user.id),
  ]);
  return {
    ...(profile?.data || {}),
    id: user.id,
    email: (user.email || '').toLowerCase(),
    full_name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
    phone: profile?.phone || '',
    cpf: profile?.cpf || '',
    course: profile?.course || '',
    role: (roles || []).some((r) => r.role === 'admin') ? 'admin' : 'user',
    created_date: user.created_at,
  };
}

function authError(error, fallback) {
  const map = {
    'Invalid login credentials': 'E-mail ou senha inválidos.',
    'Email not confirmed': 'Confirme seu e-mail pelo link que enviamos antes de entrar.',
    'User already registered': 'Já existe uma conta com este e-mail. Entre ou redefina sua senha.',
  };
  const err = new Error(map[error?.message] || error?.message || fallback);
  err.status = error?.status;
  return err;
}

const userEntity = {
  async list() {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('*').limit(1000),
      supabase.from('user_roles').select('user_id, role'),
    ]);
    const adminIds = new Set((roles || []).filter((r) => r.role === 'admin').map((r) => r.user_id));
    return { items: (profiles || []).map((p) => ({ ...(p.data || {}), id: p.id, email: p.email, full_name: p.full_name, role: adminIds.has(p.id) ? 'admin' : 'user', created_date: p.created_date })) };
  },
};

const entities = new Proxy({}, {
  get(_, name) {
    if (name === 'User') return userEntity;
    const table = ENTITY_TABLES[name];
    if (!table) throw new Error(`Entidade desconhecida: ${String(name)}`);
    return createEntity(supabase, table);
  },
});

export const base44 = {
  entities,
  app: { getPublicSettings: async () => ({ id: 'lovable', public_settings: {} }) },
  auth: {
    me: currentUser,
    async isAuthenticated() {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    },
    async loginViaEmailPassword(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw authError(error, 'Não foi possível entrar.');
      return data;
    },
    async register({ email, password, full_name }) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin + (new URLSearchParams(window.location.search).get('returnTo') || '/minha-area'), data: full_name ? { full_name } : undefined },
      });
      if (error) throw authError(error, 'Não foi possível criar a sua conta.');
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error('Já existe uma conta com este e-mail. Entre ou use "Esqueci minha senha".');
      }
      return data;
    },
    async resendOtp(email) {
      const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
      if (error) throw authError(error, 'Não foi possível reenviar o e-mail.');
    },
    async verifyOtp({ email, otpCode }) {
      const { data, error } = await supabase.auth.verifyOtp({ email: email.trim(), token: otpCode, type: 'signup' });
      if (error) throw authError(error, 'Código inválido.');
      return data;
    },
    async resetPasswordRequest(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw authError(error, 'Não foi possível enviar o e-mail.');
    },
    async resetPassword({ newPassword, password } = {}) {
      const { error } = await supabase.auth.updateUser({ password: newPassword || password });
      if (error) throw authError(error, 'Não foi possível redefinir a senha.');
    },
    async updateMe(payload = {}) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Entre novamente para continuar.');
      const { full_name, phone, cpf, course, ...rest } = payload;
      const { data: cur } = await supabase.from('profiles').select('data').eq('id', user.id).maybeSingle();
      const patch = { data: { ...(cur?.data || {}), ...rest } };
      if (full_name !== undefined) patch.full_name = full_name;
      if (phone !== undefined) patch.phone = phone;
      // O CPF só é gravado pelo servidor, que o criptografa antes de salvar.
      if (course !== undefined) patch.course = course;
      const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
      if (error) throw authError(error, 'Não foi possível salvar.');
      return currentUser();
    },
    async loginWithProvider(provider, returnTo = '/') {
      try { sessionStorage.setItem('auth-return-to', returnTo || '/'); } catch { /* ignore */ }
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) throw authError(result.error, 'Não foi possível entrar com o Google.');
      if (!result.redirected) window.location.href = returnTo || '/';
    },
    setToken() { /* sessions are managed automatically */ },
    async logout(redirectUrl) {
      await supabase.auth.signOut();
      claimed = false;
      if (redirectUrl) window.location.href = '/';
    },
    redirectToLogin(returnTo) {
      const path = returnTo ? new URL(returnTo, window.location.origin).pathname : '/';
      window.location.href = `/login?returnTo=${encodeURIComponent(path)}`;
    },
  },
  functions: {
    async invoke(name, payload) {
      const raw = await invokeAction({ data: { name, payload } });
      let parsed = null;
      try { parsed = raw.body ? JSON.parse(raw.body) : null; } catch { parsed = { raw: raw.body }; }
      const res = { status: raw.status, data: parsed };
      if (res.status >= 400) {
        const err = new Error(res.data?.error || 'Não foi possível concluir a ação.');
        err.status = res.status;
        err.response = { status: res.status, data: res.data };
        throw err;
      }
      return { data: res.data, status: res.status };
    },
  },
  integrations: {
    Core: {
      async UploadPublicFile({ file }) {
        const ext = (file.name?.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
        const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from('public-files').upload(path, file, { contentType: file.type || undefined });
        if (error) throw authError(error, 'Falha no envio do arquivo.');
        return { file_url: `${window.location.origin}/api/public/files/${path}` };
      },
    },
  },
};
