import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { hasPermission, permissionsFromRoles } from './permissions';

function permissionsOfProfile(profile) {
  const roles = Array.isArray(profile?.roles) ? profile.roles : [];
  const explicit = Array.isArray(profile?.permissions) ? profile.permissions : [];
  return Array.from(new Set([...permissionsFromRoles(roles), ...explicit]));
}

export function useStaff() {
  const [state, setState] = useState({
    loading: true,
    user: null,
    profile: null,
    permissions: [],
  });

  const load = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      if (!user) {
        setState({ loading: false, user: null, profile: null, permissions: [] });
        return;
      }

      let profile = null;
      try {
        const page = await base44.entities.StaffProfile.filter({ user_email: user.email }, { limit: 1 });
        profile = page?.items?.[0] || null;
      } catch (error) {
        profile = null;
      }

      // Acesso ao painel só por convite: é preciso um cadastro de acesso ativo.
      let permissions = profile && profile.active !== false ? permissionsOfProfile(profile) : [];

      // Exceção única para a conta fundadora, enquanto nenhum convite existir.
      if (permissions.length === 0 && !profile && user.role === 'admin') {
        const registered = await base44.entities.StaffProfile.count({});
        if (!registered) permissions = ['*'];
      }

      // Sincroniza o role da plataforma quando o usuário tem acesso de diretoria
      // mas o User.role ainda não foi atualizado (convite feito antes do cadastro).
      if (permissions.length > 0 && user.role !== 'admin') {
        try {
          await base44.functions.invoke('staffData', { action: 'sync' });
        } catch (syncError) {
          // ignora — o painel ainda carrega, mas operações via RLS podem falhar
        }
      }

      setState({ loading: false, user, profile, permissions });
    } catch (error) {
      setState({ loading: false, user: null, profile: null, permissions: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const can = useCallback((permission) => hasPermission(state.permissions, permission), [state.permissions]);

  return {
    ...state,
    isStaff: state.permissions.length > 0,
    can,
    reload: load,
  };
}