import { CreateClientInput, IClientRepository } from '../domain/IClientRepository';

export function createClient(repository: IClientRepository, input: CreateClientInput): Promise<void> {
  return repository.createClient(input);
}
