import { Subscription } from './Subscription';

export interface CreateSubscriptionInput {
  id: string;
  name: string;
}

export interface ISubscriptionRepository {
  listSubscriptions(): Promise<Subscription[]>;
  createSubscription(input: CreateSubscriptionInput): Promise<void>;
  deleteSubscription(subscriptionId: string): Promise<void>;
}
