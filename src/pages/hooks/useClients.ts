import { useCallback, useEffect, useState } from 'react';
import { useClientsContext } from '../../modules/clients/ClientsContext';
import { Client } from '../../modules/clients/domain/Client';

export function useClients() {
  const { useCases } = useClientsContext();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setClients(await useCases.listClients());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error carregant els clients');
    } finally {
      setLoading(false);
    }
  }, [useCases]);

  useEffect(() => { void reload(); }, [reload]);

  return { clients, loading, error, reload };
}
