import { CreateSubscriptionInput, ISubscriptionRepository } from '../../domain/ISubscriptionRepository';
import { Subscription } from '../../domain/Subscription';
import { httpClient } from '../../../../shared/infrastructure/http/httpClient';

interface SubscriptionDto {
  id: string;
  name: string;
}

function toSubscription(dto: SubscriptionDto): Subscription {
  return {
    id: dto.id,
    name: dto.name,
  };
}

export class SubscriptionRepository implements ISubscriptionRepository {
  async listSubscriptions(): Promise<Subscription[]> {
    const dtos = await httpClient.get<SubscriptionDto[]>('/v1/backoffice/subscriptions');
    return dtos.map(toSubscription);
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<void> {
    await httpClient.put<void>(`/v1/backoffice/subscriptions/${input.id}`, {
      name: input.name,
    });
  }

  async deleteSubscription(subscriptionId: string): Promise<void> {
    await httpClient.delete(`/v1/backoffice/subscriptions/${subscriptionId}`);
  }
}
