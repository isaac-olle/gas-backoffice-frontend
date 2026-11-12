import { useEffect, useState } from 'react';
import { useEventsContext } from '../../modules/events/EventsContext';
import { GasEvent } from '../../modules/events/domain/GasEvent';

export function useGasEvents() {
  const { useCases } = useEventsContext();
  const [events, setEvents] = useState<GasEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    useCases.listEvents()
      .then((result) => { if (active) setEvents(result); })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Error carregant els events');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [useCases]);

  return { events, loading, error };
}
