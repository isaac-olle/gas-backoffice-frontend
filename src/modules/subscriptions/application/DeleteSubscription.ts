import { ISubscriptionRepository } from '../domain/ISubscriptionRepository';

export function deleteSubscription(
  repository: ISubscriptionRepository,
  subscriptionId: string,
): Promise<void> {
  return repository.deleteSubscription(subscriptionId);
}
