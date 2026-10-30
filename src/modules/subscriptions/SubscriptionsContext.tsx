import { createContext, ReactNode, useContext, useMemo } from 'react';
import { listSubscriptions } from './application/ListSubscriptions';
import { createSubscription } from './application/CreateSubscription';
import { deleteSubscription } from './application/DeleteSubscription';
import { CreateSubscriptionInput, ISubscriptionRepository } from './domain/ISubscriptionRepository';
import { Subscription } from './domain/Subscription';

interface SubscriptionsUseCases {
  listSubscriptions: () => Promise<Subscription[]>;
  createSubscription: (input: CreateSubscriptionInput) => Promise<void>;
  deleteSubscription: (subscriptionId: string) => Promise<void>;
}

const SubscriptionsContext = createContext<SubscriptionsUseCases | undefined>(undefined);

interface SubscriptionsProviderProps {
  subscriptionRepository: ISubscriptionRepository;
  children: ReactNode;
}

export function SubscriptionsProvider({
  subscriptionRepository,
  children,
}: SubscriptionsProviderProps) {
  const useCases = useMemo<SubscriptionsUseCases>(
    () => ({
      listSubscriptions: () => listSubscriptions(subscriptionRepository),
      createSubscription: (input) => createSubscription(subscriptionRepository, input),
      deleteSubscription: (subscriptionId) => deleteSubscription(subscriptionRepository, subscriptionId),
    }),
    [subscriptionRepository],
  );

  return <SubscriptionsContext.Provider value={useCases}>{children}</SubscriptionsContext.Provider>;
}

export function useSubscriptionsContext() {
  const context = useContext(SubscriptionsContext);
  if (!context) throw new Error('useSubscriptionsContext must be used within a SubscriptionsProvider');
  return context;
}
