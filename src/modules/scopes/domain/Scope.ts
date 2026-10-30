export interface Scope {
  id: string;
  name: string;
  protectedResourceId: string;
  authorId: string;
  authorRole: string;
  allowedClientIds: string[];
  isSystem: boolean;
  enabled: boolean;
  version: number;
}
