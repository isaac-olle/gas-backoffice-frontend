import { createContext, useContext, useMemo, ReactNode } from 'react';
import { IGasEventRepository } from './domain/IGasEventRepository';
import { GasEvent } from './domain/GasEvent';
import { listEvents } from './application/ListEvents';

interface EventsContextType {
  useCases: { listEvents: () => Promise<GasEvent[]> };
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ gasEventRepository, children }: {
  gasEventRepository: IGasEventRepository;
  children: ReactNode;
}) {
  const useCases = useMemo(() => ({
    listEvents: () => listEvents(gasEventRepository),
  }), [gasEventRepository]);

  return <EventsContext.Provider value={{ useCases }}>{children}</EventsContext.Provider>;
}

export function useEventsContext() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEventsContext must be used within an EventsProvider');
  }
  return context;
}
