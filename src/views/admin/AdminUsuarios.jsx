import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Save, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PERMISSION_DEFINITIONS, ROLE_DEFINITIONS, permissionsFromRoles } from '@/lib/permissions';
import { formatDate } from '@/lib/format';

function CheckRow({ checked, onChange, title, description }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:border-brand-primary/40">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4"
      />
      <span>
        <span className="block text-sm font-medium text-brand-deep">{title}</span>
        {description && <span className="block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
}

function hasPanelAccess(user, profile) {
  return (profile?.roles?.length || 0) > 0 || user.role === 'admin';
}

export default function AdminUsuarios() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [feedback, setFeedback] = useState('');
  const [inviting, setInviting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ roles: [], permissions: [], active: true, note: '' });
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [removingBusy, setRemovingBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [userResult, profilePage, current] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.StaffProfile.filter({}, { limit: 200 }),
        base44.auth.me(),
      ]);
      setUsers(Array.isArray(userResult) ? userResult : userResult?.items || []);
      setProfiles(profilePage?.items || []);
      setMe(current || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const invite = async (event) => {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setFeedback('');
    try {
      const response = await base44.functions.invoke('staffAccess', {
        action: 'invite',
        email: inviteEmail.trim(),
        role: inviteRole ? 'admin' : 'user',
        roles: inviteRole ? [inviteRole] : [],
      });
      const data = response.data || {};
      const parts = [data.message || `Convite enviado para ${inviteEmail.trim()}.`];
      if (data.registerUrl && !data.hasAccount) {
        parts.push(
          `Compartilhe este link de cadastro com a pessoa: ${data.registerUrl}`,
        );
      }
      setFeedback(parts.join(' '));
      setInviteEmail('');
      await load();
    } catch (error) {
      setFeedback(error?.response?.data?.error || 'Não foi possível enviar o convite. Verifique o e-mail e tente novamente.');
    } finally {
      setInviting(false);
    }
  };

  const openPermissions = (user) => {
    const profile = profiles.find((item) => item.user_email === user.email);
    setEditing(user);
    setForm({
      roles: profile?.roles || (user.role === 'admin' ? ['admin_geral'] : []),
      permissions: profile?.permissions?.length ? profile.permissions : permissionsFromRoles(profile?.roles || []),
      active: profile?.active !== false,
      note: profile?.note || '',
    });
  };

  const toggleRole = (roleKey, checked) => {
    setForm((current) => {
      const roles = checked ? [...new Set([...current.roles, roleKey])] : current.roles.filter((item) => item !== roleKey);
      return { ...current, roles, permissions: permissionsFromRoles(roles) };
    });
  };

  const togglePermission = (permissionKey, checked) => {
    setForm((current) => ({
      ...current,
      permissions: checked
        ? [...new Set([...current.permissions, permissionKey])]
        : current.permissions.filter((item) => item !== permissionKey),
    }));
  };

  const savePermissions = async () => {
    if (!editing) return;
    setSaving(true);
    setFeedback('');
    try {
      const response = await base44.functions.invoke('staffAccess', {
        action: 'permissions',
        user_id: editing.id,
        user_email: editing.email,
        user_name: editing.full_name,
        roles: form.roles,
        permissions: form.permissions,
        active: form.active,
        note: form.note,
      });
      setEditing(null);
      setFeedback(response.data?.message || 'Permissões atualizadas.');
      await load();
    } catch (error) {
      setFeedback(error?.response?.data?.error || 'Não foi possível salvar as permissões.');
    } finally {
      setSaving(false);
    }
  };

  const removeAccess = async (target) => {
    if (!target) return;
    setRemovingBusy(true);
    setFeedback('');
    try {
      const response = await base44.functions.invoke('staffAccess', {
        action: 'remove',
        user_id: target.id,
        user_email: target.email,
        user_name: target.full_name,
      });
      setRemoving(null);
      setFeedback(response.data?.message || 'Acesso ao painel removido.');
      await load();
    } catch (error) {
      setFeedback(error?.response?.data?.error || 'Não foi possível remover o acesso ao painel.');
    } finally {
      setRemovingBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-lg uppercase tracking-tight text-brand-deep">Usuários e permissões</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Convide pessoas para a plataforma e defina o que cada diretoria pode administrar. O acesso administrativo só
          existe por convite, e as regras também são aplicadas no banco de dados — esconder um botão não é o que protege
          o sistema.
        </p>
      </div>

      {feedback && <p className="rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand-deep">{feedback}</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-heading text-sm uppercase tracking-[0.16em] text-brand-deep">Convidar pessoa</h3>
        <p className="mt-2 text-sm text-slate-500">
          Só entra no painel quem for convidado por um administrador. Quem se cadastra sozinho no site entra como aluno,
          sem acesso administrativo.
        </p>
        <form onSubmit={invite} className="mt-5 flex flex-wrap items-end gap-4">
          <div className="min-w-[240px] flex-1">
            <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">E-mail</Label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="pessoa@email.com"
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Acesso concedido</Label>
            <select
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value)}
              className="mt-2 h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Aluno (sem acesso ao painel)</option>
              {ROLE_DEFINITIONS.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={inviting} className="rounded-full bg-brand-primary">
            {inviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Enviar convite
          </Button>
        </form>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="table-cards cards-usuarios w-full min-w-[720px] text-sm">
          <thead className="bg-brand-soft">
            <tr className="text-left font-heading text-[0.7rem] uppercase tracking-[0.14em] text-brand-deep">
              <th className="px-4 py-3">Pessoa</th>
              <th className="px-4 py-3">Acesso à plataforma</th>
              <th className="px-4 py-3">Funções no painel</th>
              <th className="px-4 py-3">Permissões</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                </td>
              </tr>
            )}
            {!loading &&
              users.map((user) => {
                const profile = profiles.find((item) => item.user_email === user.email);
                return (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-brand-deep">{user.full_name || '—'}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {user.role === 'admin' ? 'Administrador' : 'Aluno'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {profile?.roles?.length
                        ? profile.roles
                            .map((role) => ROLE_DEFINITIONS.find((item) => item.key === role)?.label || role)
                            .join(', ')
                        : user.role === 'admin'
                          ? 'Administrador geral'
                          : 'Sem função no painel'}
                      {profile?.invited_by ? (
                        <p className="mt-1 text-xs text-slate-400">
                          Convidado por {profile.invited_by_name || profile.invited_by}
                          {profile.invited_at ? ` em ${formatDate(profile.invited_at)}` : ''}
                        </p>
                      ) : (
                        !profile &&
                        user.role === 'admin' && (
                          <p className="mt-1 text-xs text-amber-600">Sem convite registrado — sem acesso ao painel</p>
                        )
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {profile?.permissions?.includes('*') || user.role === 'admin'
                        ? 'Acesso total'
                        : `${profile?.permissions?.length || 0} permissão(ões)`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openPermissions(user)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-deep"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" /> Definir permissões
                        </button>
                        {me?.email !== user.email && hasPanelAccess(user, profile) && (
                          <button
                            type="button"
                            onClick={() => setRemoving(user)}
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remover do painel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase tracking-tight">
              Permissões de {editing?.full_name || editing?.email}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <p className="font-heading text-xs uppercase tracking-[0.16em] text-brand-deep">Funções</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {ROLE_DEFINITIONS.map((role) => (
                  <CheckRow
                    key={role.key}
                    checked={form.roles.includes(role.key)}
                    onChange={(checked) => toggleRole(role.key, checked)}
                    title={role.label}
                    description={role.description}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="font-heading text-xs uppercase tracking-[0.16em] text-brand-deep">
                Permissões específicas
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Ajuste individualmente o que esta pessoa pode administrar. A função “Administrador geral” concede acesso
                total.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {PERMISSION_DEFINITIONS.map((permission) => (
                  <CheckRow
                    key={permission.key}
                    checked={form.permissions.includes('*') || form.permissions.includes(permission.key)}
                    onChange={(checked) => togglePermission(permission.key, checked)}
                    title={permission.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
              <span className="text-sm text-brand-deep">Acesso ativo ao painel</span>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => setForm((current) => ({ ...current, active: checked }))}
              />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-slate-500">Observação interna</Label>
              <Input
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setEditing(null)} className="rounded-full">
              Cancelar
            </Button>
            <Button onClick={savePermissions} disabled={saving} className="rounded-full bg-brand-primary">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar permissões
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(removing)} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remover {removing?.full_name || removing?.email} da comissão do painel?
            </AlertDialogTitle>
            <AlertDialogDescription>
              A pessoa perde o acesso administrativo imediatamente e volta a ser apenas aluno. As inscrições, ingressos e
              pedidos dela continuam no sistema. Você pode convidar novamente quando quiser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction disabled={removingBusy} onClick={() => removeAccess(removing)}>
              {removingBusy ? 'Removendo…' : 'Remover acesso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section className="rounded-2xl bg-brand-deep p-6 text-white">
        <p className="flex items-center gap-2 font-heading text-xs uppercase tracking-[0.18em] text-brand-gold">
          <Plus className="h-3.5 w-3.5" /> Como funciona a segurança
        </p>
        <ul className="mt-4 space-y-2 text-sm text-white/75">
          <li>• O acesso ao painel é somente por convite: cada liberação fica registrada com o nome de quem convidou.</li>
          <li>• Somente quem tem permissão de diretoria acessa o painel administrativo.</li>
          <li>• O banco de dados aplica regras de acesso: conteúdo público é leitura para todos; escrita apenas para a diretoria.</li>
          <li>• Cada aluno vê somente as próprias inscrições, ingressos e pedidos.</li>
          <li>• Ações administrativas importantes ficam registradas no histórico.</li>
        </ul>
      </section>
    </div>
  );
}