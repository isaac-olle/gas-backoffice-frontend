export type ClientStatus = 'active' | 'inactive';

export interface Client {
  id: string;
  name: string;
  status: ClientStatus;
  subscriptionId: string;
  authorId: string;
  authorRole: string;
  public: boolean;
  isSystem: boolean;
  allowedGrantTypes: string[];
  redirectUris: string[];
  secretIds: string[];
  allowedScopes: string[];
  version: number;
}
