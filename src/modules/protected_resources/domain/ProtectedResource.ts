export type ProtectedResourceStatus = 'active' | 'inactive';

export interface ProtectedResource {
  id: string;
  name: string;
  url: string | null;
  status: ProtectedResourceStatus;
  authorId: string;
  authorRole: string;
  isSystem: boolean;
  scopes: string[];
  version: number;
}
