import { useCallback, useEffect, useState } from 'react';
import { useUsersContext } from '../../modules/users/UsersContext';
import { ManagedUser } from '../../modules/users/domain/ManagedUser';

export function useManagedUsers() {
  const { useCases } = useUsersContext();
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await useCases.listManagedUsers();
      setManagedUsers(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error carregant els usuaris');
    } finally {
      setLoading(false);
    }
  }, [useCases]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { managedUsers, loading, error, reload };
}
