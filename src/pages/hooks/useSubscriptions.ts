import { useCallback, useEffect, useState } from 'react';
import { useSubscriptionsContext } from '../../modules/subscriptions/SubscriptionsContext';
import { Subscription } from '../../modules/subscriptions/domain/Subscription';

export function useSubscriptions() {
  const { listSubscriptions } = useSubscriptionsContext();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSubscriptions(await listSubscriptions());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error carregant les subscripcions');
    } finally {
      setLoading(false);
    }
  }, [listSubscriptions]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { subscriptions, loading, error, reload };
}
