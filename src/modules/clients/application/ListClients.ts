import { IClientRepository } from '../domain/IClientRepository';
import { Client } from '../domain/Client';

export function listClients(clientRepository: IClientRepository): Promise<Client[]> {
  return clientRepository.listClients();
}
