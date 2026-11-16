import { ProtectedResource } from './ProtectedResource';

export interface CreateProtectedResourceInput {
  id: string;
  subscriptionId: string;
  name: string;
  url?: string | null;
}

export interface UpdateProtectedResourceUrlInput {
  id: string;
  url: string;
}

export interface IProtectedResourceRepository {
  listProtectedResources(): Promise<ProtectedResource[]>;
  createProtectedResource(input: CreateProtectedResourceInput): Promise<void>;
  updateProtectedResourceUrl(input: UpdateProtectedResourceUrlInput): Promise<void>;
}
