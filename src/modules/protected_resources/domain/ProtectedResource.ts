export type ProtectedResourceStatus = 'active' | 'inactive';

export interface ProtectedResource {
  id: string;
  name: string;
  status: ProtectedResourceStatus;
  authorId: string;
  authorRole: string;
  isSystem: boolean;
  scopes: string[];
  version: number;
}
