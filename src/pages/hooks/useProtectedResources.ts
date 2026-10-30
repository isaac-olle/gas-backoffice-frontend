import { useCallback, useEffect, useState } from 'react';
import { useProtectedResourcesContext } from '../../modules/protected_resources/ProtectedResourcesContext';
import { ProtectedResource } from '../../modules/protected_resources/domain/ProtectedResource';

export function useProtectedResources() {
  const { useCases } = useProtectedResourcesContext();
  const [protectedResources, setProtectedResources] = useState<ProtectedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProtectedResources(await useCases.listProtectedResources());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error carregant els protected resources');
    } finally {
      setLoading(false);
    }
  }, [useCases]);

  useEffect(() => { void reload(); }, [reload]);

  return { protectedResources, loading, error, reload };
}
