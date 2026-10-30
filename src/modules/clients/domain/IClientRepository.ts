import { Client } from './Client';

export interface ClientAuthentication {
  clientSecret?: { id: string; secret: string };
  clientAssertionKey?: { id: string; key: string; format: string };
}

export interface CreateClientInput {
  id: string;
  subscriptionId: string;
  name: string;
  allowedGrantTypes: string[];
  redirectUris: string[];
  public: boolean;
  authentication: ClientAuthentication;
  allowedScopes: string[];
}

export interface IClientRepository {
  listClients(): Promise<Client[]>;
  createClient(input: CreateClientInput): Promise<void>;
}
