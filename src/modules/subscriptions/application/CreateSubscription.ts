import { CreateSubscriptionInput, ISubscriptionRepository } from '../domain/ISubscriptionRepository';

export function createSubscription(
  repository: ISubscriptionRepository,
  input: CreateSubscriptionInput,
): Promise<void> {
  return repository.createSubscription(input);
}
