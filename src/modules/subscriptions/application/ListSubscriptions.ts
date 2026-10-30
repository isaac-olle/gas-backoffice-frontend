import { ISubscriptionRepository } from '../domain/ISubscriptionRepository';
import { Subscription } from '../domain/Subscription';

export function listSubscriptions(
  subscriptionRepository: ISubscriptionRepository,
): Promise<Subscription[]> {
  return subscriptionRepository.listSubscriptions();
}
