import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useCollection(entity, query = {}, options = {}) {
  // offlineKey: guarda a última lista no aparelho e usa essa cópia quando não há internet.
  const { sort = '-created_date', limit = 60, enabled = true, offlineKey } = options;
  const [state, setState] = useState({ items: [], loading: true, error: null });
  const queryKey = JSON.stringify(query);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (!enabled) {
      setState({ items: [], loading: false, error: null });
      return;
    }
    setState((current) => ({ ...current, loading: true }));
    try {
      const page = await base44.entities[entity].filter(JSON.parse(queryKey), { sort, limit });
      const items = page?.items || [];
      if (offlineKey) {
        try { localStorage.setItem(offlineKey, JSON.stringify(items)); } catch { /* ignore */ }
      }
      if (mounted.current) setState({ items, loading: false, error: null });
    } catch (error) {
      let saved = [];
      if (offlineKey) {
        try { saved = JSON.parse(localStorage.getItem(offlineKey) || '[]'); } catch { /* ignore */ }
      }
      if (mounted.current) setState({ items: saved, loading: false, error });
    }
  }, [entity, queryKey, sort, limit, enabled, offlineKey]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { ...state, reload: load };
}
