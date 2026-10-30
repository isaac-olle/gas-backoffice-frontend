import { IManagedUserRepository } from '../domain/IManagedUserRepository';

export function addSubscriptionPermission(
  managedUserRepository: IManagedUserRepository,
  userId: string,
  subscriptionId: string,
): Promise<void> {
  return managedUserRepository.addSubscriptionPermission(userId, subscriptionId);
}
