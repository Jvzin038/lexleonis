import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useCollection(entity, query = {}, options = {}) {
  const { sort = '-created_date', limit = 60, enabled = true } = options;
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
      if (mounted.current) setState({ items: page?.items || [], loading: false, error: null });
    } catch (error) {
      if (mounted.current) setState({ items: [], loading: false, error });
    }
  }, [entity, queryKey, sort, limit, enabled]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { ...state, reload: load };
}