import { ProtectedResource } from './ProtectedResource';

export interface CreateProtectedResourceInput {
  id: string;
  subscriptionId: string;
  name: string;
}

export interface IProtectedResourceRepository {
  listProtectedResources(): Promise<ProtectedResource[]>;
  createProtectedResource(input: CreateProtectedResourceInput): Promise<void>;
}
